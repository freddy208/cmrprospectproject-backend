import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { LeadChannel } from '@prisma/client';

export class UpdateInteractionDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsEnum(LeadChannel)
  @IsOptional()
  channel?: LeadChannel;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  duration?: number;
}
