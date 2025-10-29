import { IsString, IsOptional, IsEnum } from 'class-validator';
import { LeadChannel } from '@prisma/client';

export class FilterInteractionDto {
  @IsString()
  @IsOptional()
  prospectId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(LeadChannel)
  @IsOptional()
  channel?: LeadChannel;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
