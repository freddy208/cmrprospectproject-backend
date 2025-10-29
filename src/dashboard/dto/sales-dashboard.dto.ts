import { TopProspectDto, ActivityDto } from './shared.dto';

export class SalesOverviewDto {
  userId!: string;
  totalAssigned!: number;
  totalCreated!: number;
  newProspectsLast7Days!: number;
  prospectsByStatus!: { status: string; count: number }[];
  conversionRate?: number;
}

export class SalesDashboardDto {
  overview!: SalesOverviewDto;
  myRecentProspects?: TopProspectDto[];
  recentActivities?: ActivityDto[];
  followUps?: TopProspectDto[]; // prospects needing follow-up (nextCallDate)
}
