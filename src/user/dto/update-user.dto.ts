import { IsEmail, IsOptional, MinLength, IsEnum } from 'class-validator';
import { UserRole, Status } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  country: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
