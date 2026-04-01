import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  senderProfileId: string;

  @IsString()
  @IsNotEmpty()
  receiverProfileId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
