import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateChildProfileDto, UpdateChildProfileDto } from './dto/child-profile.dto';
import { AutoFillService } from '../user/auto-fill.service';

@Injectable()
export class ChildProfileService {
  private readonly logger = new Logger(ChildProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly autoFill: AutoFillService,
  ) {}

  async create(userId: string, dto: CreateChildProfileDto) {
    // Auto-generate about_us / expectations if not provided
    const generated = this.autoFill.generate({
      gender: dto.gender,
      dateOfBirth: new Date(dto.dateOfBirth),
      height: dto.height,
      country: dto.country,
      city: dto.city,
    });

    // Generate unique memberId: MN-XXXXXX (6-digit zero-padded counter)
    const count = await this.prisma.childProfile.count();
    const memberId = `MN-${String(count + 1).padStart(6, '0')}`;

    const profile = await this.prisma.childProfile.create({
      data: {
        ...dto,
        dateOfBirth: new Date(dto.dateOfBirth),
        userId,
        memberId,
        aboutUs: dto.aboutUs ?? generated.aboutUs,
        expectations: dto.expectations ?? generated.expectations,
        status: 'DRAFT',
      },
      include: { subscription: true },
    });

    this.events.emit('PROFILE_CREATED', { profileId: profile.id, userId });
    this.logger.log(`Profile CREATED: ${profile.id} (${memberId}) by user ${userId}`);

    return { success: true, data: profile };
  }

  async update(userId: string, profileId: string, dto: UpdateChildProfileDto) {
    const profile = await this.findOwnedProfile(userId, profileId);

    const updated = await this.prisma.childProfile.update({
      where: { id: profile.id },
      data: { ...dto, dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined },
      include: { subscription: true },
    });

    this.logger.log(`Profile UPDATED: ${profileId}`);
    return { success: true, data: updated };
  }

  async updatePrivacy(userId: string, profileId: string, data: { showRealName?: boolean; nickname?: string }) {
    const profile = await this.findOwnedProfile(userId, profileId);

    const updated = await this.prisma.childProfile.update({
      where: { id: profile.id },
      data: {
        showRealName: data.showRealName,
        nickname: data.nickname,
      } as any,
      include: { subscription: true },
    });

    this.logger.log(`Profile PRIVACY UPDATED: ${profileId} showRealName=${data.showRealName}`);
    return { success: true, data: updated };
  }

  async boostProfile(userId: string, profileId: string, days: number) {
    if (![10, 15, 30].includes(days)) throw new Error('Invalid boost duration. Choose 10, 15 or 30 days.');
    const profile = await this.findOwnedProfile(userId, profileId);
    if (profile.status !== 'ACTIVE') throw new Error('Only active profiles can be boosted.');
    const boostExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const updated = await this.prisma.childProfile.update({
      where: { id: profile.id },
      data: { boostExpiresAt } as any,
      include: { subscription: true },
    });
    this.logger.log(`Profile BOOSTED: ${profileId} for ${days} days until ${boostExpiresAt}`);
    return { success: true, data: updated, boostExpiresAt };
  }

  async getMyProfiles(userId: string) {
    const profiles = await this.prisma.childProfile.findMany({
      where: { userId },
      include: { subscription: true },
    });
    return { success: true, data: profiles };
  }

  async getOne(userId: string, profileId: string) {
    const profile = await this.findOwnedProfile(userId, profileId);
    return { success: true, data: profile };
  }

  async delete(userId: string, profileId: string) {
    await this.findOwnedProfile(userId, profileId);
    await this.prisma.childProfile.delete({ where: { id: profileId } });
    this.logger.log(`Profile DELETED: ${profileId}`);
    return { success: true, message: 'Profile deleted' };
  }

  // ─── Shortlist / Favorites ───────────────────────────────────────────────
  async toggleShortlist(userId: string, ownerProfileId: string, targetProfileId: string) {
    await this.findOwnedProfile(userId, ownerProfileId);
    
    const existing = await this.prisma.shortlist.findUnique({
      where: {
        ownerProfileId_targetProfileId: { ownerProfileId, targetProfileId }
      }
    });

    if (existing) {
      await this.prisma.shortlist.delete({ where: { id: existing.id } });
      return { success: true, message: 'Removed from shortlist', shortlisted: false };
    } else {
      await this.prisma.shortlist.create({
        data: { ownerProfileId, targetProfileId }
      });
      return { success: true, message: 'Added to shortlist', shortlisted: true };
    }
  }

  async getShortlists(userId: string, profileId: string) {
    await this.findOwnedProfile(userId, profileId);

    const shortlists = await this.prisma.shortlist.findMany({
      where: { ownerProfileId: profileId },
      include: {
        targetProfile: {
          select: {
             id: true, memberId: true, name: true, gender: true, city: true, occupation: true, viewCount: true,
             photos: {
               where: { isPrimary: true },
               take: 1,
               select: { url: true }
             }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: shortlists };
  }

  async getRecommendations(userId: string, profileId: string) {
    const profile = await this.findOwnedProfile(userId, profileId);

    // Set defaults if preferences are missing (to ensure we always return something)
    const minAge = profile.minAgePreference ?? 18;
    const maxAge = profile.maxAgePreference ?? 50;
    
    const today = new Date();
    // A person who is maxAge years old was born today - maxAge years ago
    const minDob = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
    // A person who is minAge years old was born today - minAge years ago
    const maxDob = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());

    const oppositeGender = profile.gender === 'MALE' ? 'FEMALE' : 'MALE';

    const whereClause: any = {
      status: 'ACTIVE',
      gender: oppositeGender,
      dateOfBirth: {
        gte: minDob,
        lte: maxDob,
      },
    };

    // If country preference exists, match it. Alternatively, match user's own country as fallback.
    if (profile.countryPreference) {
      whereClause.country = profile.countryPreference;
    } else if (profile.country) {
      whereClause.country = profile.country;
    }

    const recommendations = await this.prisma.childProfile.findMany({
      where: whereClause,
      take: 8,
      orderBy: { viewCount: 'desc' }, // suggest popular profiles first
      select: {
        id: true, memberId: true, name: true, gender: true, city: true,
        occupation: true, education: true, height: true, civilStatus: true,
        dateOfBirth: true, createdAt: true, boostExpiresAt: true, isVerified: true,
        photos: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true }
        }
      }
    });

    // Optionally map dateOfBirth to age for easy frontend consumption
    const data = recommendations.map(r => ({
      ...r,
      age: Math.floor((Date.now() - new Date(r.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
    }));

    return { success: true, data };
  }

  async verifyProfile(adminId: string, profileId: string, isVerified: boolean) {
    // For now, assume admin checks are done by controller guard or similar. 
    // Just toggle the isVerified flag.
    const updated = await this.prisma.childProfile.update({
      where: { id: profileId },
      data: { isVerified, verificationStatus: isVerified ? 'APPROVED' : 'REJECTED' }
    });
    return { success: true, message: isVerified ? 'Profile verified' : 'Profile verification rejected', isVerified: updated.isVerified };
  }

  private async findOwnedProfile(userId: string, profileId: string) {
    const profile = await this.prisma.childProfile.findUnique({
      where: { id: profileId },
      include: { subscription: true },
    });
    if (!profile) throw new NotFoundException({ success: false, message: 'Profile not found', error_code: 'NOT_FOUND' });
    if (profile.userId !== userId)
      throw new ForbiddenException({ success: false, message: 'You do not own this profile', error_code: 'FORBIDDEN' });
    return profile;
  }
}
