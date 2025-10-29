/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GeneralDashboardDto, GeneralOverviewDto } from './dto/general-dashboard.dto';
import { CountryDashboardDto, CountryOverviewDto } from './dto/country-dashboard.dto';
import { SalesDashboardDto, SalesOverviewDto } from './dto/sales-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private sevenDaysAgo(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }

  // -------------------- GENERAL / DIRECTEUR --------------------
  async getGeneralDashboard(): Promise<GeneralDashboardDto> {
    const totalProspects = await this.prisma.prospect.count();

    const newProspectsLast7Days = await this.prisma.prospect.count({
      where: { createdAt: { gte: this.sevenDaysAgo() } },
    });

    // prospects by country
    const byCountry = await this.prisma.$queryRaw<
      Array<{ country: string; count: bigint }>
    >`SELECT "country", COUNT(*) FROM "Prospect" GROUP BY "country" ORDER BY COUNT DESC LIMIT 50;`;

    const prospectsByCountry = byCountry.map(b => ({ country: b.country, count: Number(b.count) }));

    // prospects by status
    const byStatus = await this.prisma.prospect.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const prospectsByStatus = byStatus.map(s => ({ status: s.status, count: s._count._all }));

    const totalConverted = (prospectsByStatus.find(p => p.status === 'CONVERTI')?.count) ?? 0;
    const totalLost = (prospectsByStatus.find(p => p.status === 'PERDU')?.count) ?? 0;
    const conversionRate = totalProspects === 0 ? 0 : (totalConverted / totalProspects) * 100;

    // top prospects (recent)
    const topProspects = await this.prisma.prospect.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, firstName: true, lastName: true, companyName: true,
        status: true, country: true, assignedToId: true, createdAt: true, updatedAt: true,
      },
    });

    // top sales officers by created prospects (limit 10)
    const topSales = await this.prisma.$queryRaw<
      Array<{ userId: string; name: string; createdProspects: bigint; converted: bigint }>
    >`SELECT "createdById" as "userId", concat(u."firstName", ' ', u."lastName") as name,
         COUNT(*) FILTER (WHERE TRUE) as "createdProspects",
         COUNT(*) FILTER (WHERE "status" = 'CONVERTI') as "converted"
       FROM "Prospect" p
       JOIN "User" u ON u."id" = p."createdById"
       GROUP BY "createdById", u."firstName", u."lastName"
       ORDER BY "converted" DESC, "createdProspects" DESC
       LIMIT 10;`;

    // recent activities (interactions)
    const recentActivities = await this.prisma.interaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, prospectId: true, userId: true, type: true, notes: true, createdAt: true },
    });

    const overview: GeneralOverviewDto = {
      totalProspects,
      newProspectsLast7Days,
      prospectsByCountry,
      prospectsByStatus,
      totalConverted,
      totalLost,
      conversionRate,
    };

    return {
      overview,
      topProspects,
      topSalesOfficers: topSales.map(s => ({
        userId: s.userId,
        name: s.name,
        createdProspects: Number(s.createdProspects),
        converted: Number(s.converted),
      })),
      recentActivities,
    };
  }

  // -------------------- COUNTRY MANAGER --------------------
  async getCountryDashboard(country: string): Promise<CountryDashboardDto> {
    if (!country) throw new BadRequestException('country is required');

    const totalProspects = await this.prisma.prospect.count({ where: { country } });

    const newProspectsLast7Days = await this.prisma.prospect.count({
      where: { country, createdAt: { gte: this.sevenDaysAgo() } },
    });

    const byStatus = await this.prisma.prospect.groupBy({
      by: ['status'],
      where: { country },
      _count: { _all: true },
    });
    const prospectsByStatus = byStatus.map(s => ({ status: s.status, count: s._count._all }));

    const totalConverted = (prospectsByStatus.find(p => p.status === 'CONVERTI')?.count) ?? 0;
    const conversionRate = totalProspects === 0 ? 0 : (totalConverted / totalProspects) * 100;

    const topProspects = await this.prisma.prospect.findMany({
      where: { country },
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, firstName: true, lastName: true, companyName: true,
        status: true, country: true, assignedToId: true, createdAt: true, updatedAt: true,
      },
    });

    // top sales in this country
    const topSales = await this.prisma.$queryRaw<
      Array<{ userId: string; name: string; createdProspects: bigint; converted: bigint }>
    >`SELECT p."createdById" as "userId", concat(u."firstName",' ',u."lastName") as name,
         COUNT(*) as "createdProspects",
         COUNT(*) FILTER (WHERE p."status" = 'CONVERTI') as "converted"
       FROM "Prospect" p
       JOIN "User" u ON u."id" = p."createdById"
       WHERE p."country" = ${country}
       GROUP BY p."createdById", u."firstName", u."lastName"
       ORDER BY "converted" DESC, "createdProspects" DESC
       LIMIT 10;`;

    const recentActivities = await this.prisma.interaction.findMany({
      where: { prospect: { country } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, prospectId: true, userId: true, type: true, notes: true, createdAt: true },
    });

    const overview: CountryOverviewDto = {
      country,
      totalProspects,
      newProspectsLast7Days,
      prospectsByStatus,
      conversionRate,
    };

    return {
      overview,
      topSalesOfficers: topSales.map(s => ({
        userId: s.userId,
        name: s.name,
        createdProspects: Number(s.createdProspects),
        converted: Number(s.converted),
      })),
      topProspects,
      recentActivities,
    };
  }

  // -------------------- SALES OFFICER --------------------
  async getSalesOfficerDashboard(userId: string): Promise<SalesDashboardDto> {
    if (!userId) throw new BadRequestException('userId is required');

    const totalAssigned = await this.prisma.prospect.count({ where: { assignedToId: userId } });
    const totalCreated = await this.prisma.prospect.count({ where: { createdById: userId } });

    const newProspectsLast7Days = await this.prisma.prospect.count({
      where: { createdById: userId, createdAt: { gte: this.sevenDaysAgo() } },
    });

    const byStatus = await this.prisma.prospect.groupBy({
      by: ['status'],
      where: { OR: [{ assignedToId: userId }, { createdById: userId }] },
      _count: { _all: true },
    });
    const prospectsByStatus = byStatus.map(s => ({ status: s.status, count: s._count._all }));

    const totalConverted = (prospectsByStatus.find(p => p.status === 'CONVERTI')?.count) ?? 0;
    const conversionRate = (totalAssigned + totalCreated) === 0 ? 0 : (Number(totalConverted) / (totalAssigned + totalCreated)) * 100;

    const recentProspects = await this.prisma.prospect.findMany({
      where: { OR: [{ assignedToId: userId }, { createdById: userId }] },
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, firstName: true, lastName: true, companyName: true,
        status: true, country: true, assignedToId: true, nextCallDate: true, createdAt: true, updatedAt: true,
      },
    });

    // follow-ups: prospects with nextCallDate in the future or overdue (null excluded)
    const now = new Date();
    const followUps = await this.prisma.prospect.findMany({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        AND: [{ nextCallDate: { not: null } }],
      },
      orderBy: { nextCallDate: 'asc' },
      take: 10,
      select: { id: true, firstName: true, lastName: true, companyName: true, status: true, country: true, nextCallDate: true, updatedAt: true, createdAt: true },
    });

    const recentActivities = await this.prisma.interaction.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, prospectId: true, userId: true, type: true, notes: true, createdAt: true },
    });

    const overview: SalesOverviewDto = {
      userId,
      totalAssigned,
      totalCreated,
      newProspectsLast7Days,
      prospectsByStatus,
      conversionRate,
    };

    return {
      overview,
      myRecentProspects: recentProspects,
      recentActivities,
      followUps,
    };
  }

  // -------------------- Extra KPI endpoints helpers --------------------

  // pipeline by channel for given country or global
  async pipelineByChannel(country?: string) {
    const where = country ? { country } : {};
    const grouped = await this.prisma.prospect.groupBy({
      by: ['leadChannel'],
      where,
      _count: { _all: true },
    });
    return grouped.map(g => ({ channel: g.leadChannel, count: g._count._all }));
  }

  // conversion rate in period (start, end) optionally filtered by country
  async conversionRate(start?: Date, end?: Date, country?: string) {
    const whereBase: any = {};
    if (start) whereBase.createdAt = { gte: start };
    if (end) whereBase.createdAt = whereBase.createdAt ? { ...whereBase.createdAt, lte: end } : { lte: end };
    if (country) whereBase.country = country;

    const total = await this.prisma.prospect.count({ where: whereBase });
    const converted = await this.prisma.prospect.count({ where: { ...whereBase, status: 'CONVERTI' } });
    return { total, converted, rate: total === 0 ? 0 : (converted / total) * 100 };
  }
}
