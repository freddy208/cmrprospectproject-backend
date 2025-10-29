import { IsOptional, IsEnum, IsString } from 'class-validator';
import { UserRole, Status } from '@prisma/client';

export class FilterUserDto {
  @IsOptional()
  @IsString()
  search?: string; // nom, prenom, email

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
