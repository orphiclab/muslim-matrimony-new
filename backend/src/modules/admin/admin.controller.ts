import { Controller, Post, Get, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AdminService, ApprovePaymentDto, CreatePackageDto, UpdateSiteSettingsDto } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/** Public endpoints — no auth required */
@Controller()
export class PublicPackagesController {
  constructor(private readonly service: AdminService) {}

  @Get('packages')
  getActivePackages(@Query('type') type?: string) {
    return this.service.getActivePackages(type);
  }

  @Get('settings')
  getPublicSettings() {
    return this.service.getSiteSettings();
  }

  @Get('profiles/public')
  getPublicProfiles(
    @Query('minAge') minAge?: string,
    @Query('maxAge') maxAge?: string,
    @Query('gender') gender?: string,
    @Query('city') city?: string,
    @Query('ethnicity') ethnicity?: string,
    @Query('civilStatus') civilStatus?: string,
    @Query('education') education?: string,
    @Query('occupation') occupation?: string,
    @Query('memberId') memberId?: string,
  ) {
    return this.service.getPublicProfiles({
      minAge: minAge ? parseInt(minAge) : undefined,
      maxAge: maxAge ? parseInt(maxAge) : undefined,
      gender, city, ethnicity, civilStatus, education, occupation, memberId,
    });
  }

  @Get('profiles/public/:id')
  getPublicProfile(@Param('id') id: string) {
    return this.service.getPublicProfile(id);
  }
}


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('dashboard')
  dashboard() { return this.service.getDashboard(); }

  @Post('payment/approve')
  approvePayment(@CurrentUser() user: any, @Body() dto: ApprovePaymentDto) {
    return this.service.approvePayment(user.userId, dto);
  }

  @Get('payments')
  payments(@Query('status') status?: string) { return this.service.getAllPayments(status); }

  @Get('users')
  users() { return this.service.getAllUsers(); }

  @Get('profiles')
  profiles(@Query('status') status?: string) { return this.service.getAllProfiles(status); }

  @Get('analytics')
  analytics() { return this.service.getAnalytics(); }

  @Get('messages')
  messages(@Query('limit') limit?: string) {
    return this.service.getRecentMessages(limit ? parseInt(limit) : 100);
  }

  // ─ Photos ───────────────────────────────────────────────
  @Get('photos')
  getPhotos(@Query('status') status?: string) { return this.service.getPhotos(status); }

  @Put('photos/:id/approve')
  approvePhoto(@Param('id') id: string) { return this.service.approvePhoto(id); }

  @Put('photos/:id/reject')
  rejectPhoto(@Param('id') id: string) { return this.service.rejectPhoto(id); }

  // ─ Boosts ───────────────────────────────────────────────
  @Get('boosts')
  getBoosts() { return this.service.getBoosts(); }

  @Delete('boosts/:id')
  removeBoost(@Param('id') id: string) { return this.service.removeBoost(id); }

  @Put('boosts/:id/extend')
  extendBoost(@Param('id') id: string, @Body() body: { days: number }) {
    return this.service.extendBoost(id, body.days);
  }

  // ─── Packages ─────────────────────────────────────────────────────────────
  @Get('packages')
  getPackages(@Query('type') type?: string) { return this.service.getPackages(type); }

  @Post('packages')
  createPackage(@Body() dto: CreatePackageDto) { return this.service.createPackage(dto); }

  @Put('packages/:id')
  updatePackage(@Param('id') id: string, @Body() dto: Partial<CreatePackageDto>) {
    return this.service.updatePackage(id, dto);
  }

  @Delete('packages/:id')
  deletePackage(@Param('id') id: string) { return this.service.deletePackage(id); }

  // ─── Site Settings ────────────────────────────────────────────
  @Get('settings')
  getSiteSettings() { return this.service.getSiteSettings(); }

  @Put('settings')
  updateSiteSettings(@Body() dto: UpdateSiteSettingsDto) {
    return this.service.updateSiteSettings(dto);
  }
}
