/* eslint-disable prettier/prettier */
// src/administration/dto/create-role.dto.ts
import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}