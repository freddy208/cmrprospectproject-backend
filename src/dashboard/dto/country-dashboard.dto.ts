import { TopProspectDto, ActivityDto } from './shared.dto';

export class CountryOverviewDto {
  country!: string;
  totalProspects!: number;
  newProspectsLast7Days!: number;
  prospectsByStatus!: { status: string; count: number }[];
  conversionRate?: number;
}

export class CountryDashboardDto {
  overview!: CountryOverviewDto;
  topSalesOfficers?: {
    userId: string;
    name?: string;
    createdProspects: number;
    converted: number;
  }[];
  topProspects?: TopProspectDto[];
  recentActivities?: ActivityDto[];
}
