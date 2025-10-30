// src/prospect/dto/create-prospect.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ProspectType, LeadChannel, ServiceType } from '@prisma/client';

export class CreateProspectDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsEnum(LeadChannel)
  @IsNotEmpty()
  leadChannel: LeadChannel;

  @IsEnum(ServiceType)
  @IsNotEmpty()
  serviceType: ServiceType;

  // --- CORRECTION ---
  // On rend le champ 'type' obligatoire pour correspondre au schéma BDD
  @IsEnum(ProspectType)
  @IsNotEmpty()
  type: ProspectType;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  contactFirstName?: string;

  @IsOptional()
  @IsString()
  contactLastName?: string;

  @IsOptional()
  @IsUUID()
  formationId?: string;

  @IsOptional()
  @IsUUID()
  simulateurId?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  initialComment?: string;
}
