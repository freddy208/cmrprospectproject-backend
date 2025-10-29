import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class FilterSimulateurDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
