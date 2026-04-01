import { Injectable } from '@nestjs/common';
import { Gender } from '@prisma/client';

interface AutoFillInput {
  gender: Gender;
  dateOfBirth: Date;
  height?: number;
  country?: string;
  city?: string;
}

@Injectable()
export class AutoFillService {
  generate(input: AutoFillInput): { aboutUs: string; expectations: string } {
    const age = this.getAge(input.dateOfBirth);
    const location = [input.city, input.country].filter(Boolean).join(', ');
    const heightStr = input.height ? `${input.height}cm` : 'average height';
    const pronoun = input.gender === 'MALE' ? 'He' : 'She';
    const partner = input.gender === 'MALE' ? 'a righteous sister' : 'a practising brother';

    const aboutUs = `${pronoun} is a ${age}-year-old ${input.gender === 'MALE' ? 'Muslim' : 'Muslimah'} of ${heightStr}${location ? ` based in ${location}` : ''}. ${pronoun} comes from a good family background and values Islamic principles in daily life.`;

    const expectations = `Looking for ${partner} who is practising, kind-hearted, and family-oriented. The ideal match should share similar values and be ready for a halal, committed relationship.`;

    return { aboutUs, expectations };
  }

  private getAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }
}
