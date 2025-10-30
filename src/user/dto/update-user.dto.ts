/* eslint-disable prettier/prettier */
// src/user/dto/update-user.dto.ts
import { IsEmail, IsOptional, MinLength, IsString, IsUUID, IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  // --- CHANGEMENT CRUCIAL ---
  @IsOptional()
  @IsUUID()
  roleId?: string; // On utilise l'UUID du rôle

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
