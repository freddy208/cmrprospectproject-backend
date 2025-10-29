import { TopProspectDto, ActivityDto } from './shared.dto';

export class GeneralOverviewDto {
  totalProspects!: number;
  newProspectsLast7Days!: number;
  prospectsByCountry!: { country: string; count: number }[];
  prospectsByStatus!: { status: string; count: number }[];
  totalConverted?: number;
  totalLost?: number;
  conversionRate?: number; // percent
}

export class GeneralDashboardDto {
  overview!: GeneralOverviewDto;
  topProspects?: TopProspectDto[];
  topSalesOfficers?: {
    userId: string;
    name?: string;
    createdProspects: number;
    converted: number;
  }[];
  recentActivities?: ActivityDto[];
}
