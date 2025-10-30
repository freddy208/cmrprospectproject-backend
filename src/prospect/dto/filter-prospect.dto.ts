import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ProspectStatus, ServiceType, LeadChannel } from '@prisma/client';

export class FilterProspectDto {
  @IsOptional()
  @IsString()
  search?: string; // Recherche dans email, nom, prénom, entreprise

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(ProspectStatus)
  status?: ProspectStatus;

  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @IsOptional()
  @IsEnum(LeadChannel)
  leadChannel?: LeadChannel;

  @IsOptional()
  @IsString()
  assignedToId?: string; // Filtrer par Sales Officer assigné
}
