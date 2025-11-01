// src/user/dto/filter-user.dto.ts
import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { Status } from '@prisma/client';

export class FilterUserDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  role?: string; // On peut filtrer par le nom du rôle (ex: "COUNTRY_MANAGER")

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Nouveau champ pour le tri
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'lastLogin' | 'firstName' | 'lastName' | 'email';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  offset?: string;
}
