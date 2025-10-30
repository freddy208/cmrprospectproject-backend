// src/user/dto/filter-user.dto.ts
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Status } from '@prisma/client';

// On n'a plus besoin de l'enum UserRole ici, on filtrera par nom de rôle si besoin
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
}
