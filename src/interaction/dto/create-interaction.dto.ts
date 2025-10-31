import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { LeadChannel } from '@prisma/client';

export class CreateInteractionDto {
  @IsString()
  @IsNotEmpty()
  prospectId: string; // toujours obligatoire
  @IsEnum(LeadChannel)
  @IsOptional()
  channel?: LeadChannel;

  @IsString()
  @IsOptional()
  notes: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  duration?: number; // durée de l'interaction (en minutes, par exemple)
}
