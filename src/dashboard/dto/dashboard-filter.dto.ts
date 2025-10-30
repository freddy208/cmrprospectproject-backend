import { IsOptional, IsDateString } from 'class-validator';

export class DashboardFilterDto {
  @IsOptional()
  @IsDateString()
  startDate?: string; // Format ISO 8601, ex: "2023-10-27T00:00:00.000Z"

  @IsOptional()
  @IsDateString()
  endDate?: string; // Format ISO 8601
}
