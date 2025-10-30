// src/user/dto/create-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsString()
  lastName: string;

  // --- CHANGEMENT CRUCIAL ---
  @IsUUID()
  roleId: string; // On utilise l'UUID du rôle, plus l'enum

  @IsOptional()
  @IsString()
  country?: string;
}
