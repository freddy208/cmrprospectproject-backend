/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserWithRole } from '../user/types';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { ProspectStatus } from '@prisma/client';
import { getName } from 'country-list';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Point d'entrée principal pour récupérer les statistiques du dashboard.
   * Le rôle de l'utilisateur détermine quelles données sont récupérées.
   */
  async getMainStats(user: UserWithRole, filter: DashboardFilterDto) {
    // Construit la clause `where` de base en fonction du rôle
    const baseWhereClause = this.getBaseWhereClause(user, filter);

    switch (user.role.name) {
      case 'DIRECTEUR_GENERAL':
        return this.getDirectorGeneralStats(baseWhereClause, filter);
      case 'COUNTRY_MANAGER':
        return this.getCountryManagerStats(baseWhereClause, filter);
      case 'SALES_OFFICER':
        return this.getSalesOfficerStats(baseWhereClause, filter);
      default:
        return null; // Ou lancer une exception
    }
  }

  // --- Méthodes privées pour chaque rôle ---

  private async getDirectorGeneralStats(whereClause: any, filter: DashboardFilterDto) {
    const [
      totalProspects,
      prospectsByCountry,
      prospectsByStatus,
      topSalesOfficers,
      topCountryManagers,
      totalConversions,
      activeUsers,
      prospectsByType,
    ] = await Promise.all([
      this.prisma.prospect.count({ where: whereClause }),
      this.getProspectsByCountry(whereClause),
      this.getProspectsByStatus(whereClause),
      this.getTopSalesOfficers(whereClause),
      this.getTopCountryManagers(whereClause),
      this.prisma.prospect.count({ where: { ...whereClause, status: ProspectStatus.CONVERTI } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.getProspectsByType(whereClause),
    ]);

    const conversionRate = totalProspects > 0 ? (totalConversions / totalProspects) * 100 : 0;

    return {
      totalProspects,
      prospectsByCountry,
      prospectsByStatus,
      topSalesOfficers,
      topCountryManagers,
      totalConversions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      activeUsers,
      prospectsByType,
    };
  }

  private async getCountryManagerStats(whereClause: any, filter: DashboardFilterDto) {
    const [
      totalProspects,
      prospectsByStatus,
      topSalesOfficers,
      totalConversions,
      prospectsByType,
    ] = await Promise.all([
      this.prisma.prospect.count({ where: whereClause }),
      this.getProspectsByStatus(whereClause),
      this.getTopSalesOfficers(whereClause),
      this.prisma.prospect.count({ where: { ...whereClause, status: ProspectStatus.CONVERTI } }),
      this.getProspectsByType(whereClause),
    ]);

    const conversionRate = totalProspects > 0 ? (totalConversions / totalProspects) * 100 : 0;

    return {
      totalProspects,
      prospectsByStatus,
      topSalesOfficers,
      totalConversions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      prospectsByType,
    };
  }

  private async getSalesOfficerStats(whereClause: any, filter: DashboardFilterDto) {
    const [
      totalProspects,
      prospectsByStatus,
      totalConversions,
      prospectsByType,
    ] = await Promise.all([
      this.prisma.prospect.count({ where: whereClause }),
      this.getProspectsByStatus(whereClause),
      this.prisma.prospect.count({ where: { ...whereClause, status: ProspectStatus.CONVERTI } }),
      this.getProspectsByType(whereClause),
    ]);

    const conversionRate = totalProspects > 0 ? (totalConversions / totalProspects) * 100 : 0;

    return {
      totalProspects,
      prospectsByStatus,
      totalConversions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      prospectsByType,
    };
  }

  // --- Méthodes utilitaires de requête ---

  private getBaseWhereClause(user: UserWithRole, filter?: DashboardFilterDto): any {
    const where: any = { genericStatus: 'ACTIVE' };

    if (user.role.name === 'SALES_OFFICER') {
      where.assignedToId = user.id;
    } else if (user.role.name === 'COUNTRY_MANAGER') {
      where.country = user.country;
    }
    // Le DG n'a pas de filtre de base

    if (filter?.startDate || filter?.endDate) {
      where.createdAt = {};
      if (filter.startDate) where.createdAt.gte = new Date(filter.startDate);
      if (filter.endDate) where.createdAt.lte = new Date(filter.endDate);
    }

    return where;
  }

  private async getProspectsByCountry(whereClause: any) {
    return this.prisma.prospect.groupBy({
      by: ['country'],
      where: whereClause,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
  }

  private async getProspectsByStatus(whereClause: any) {
    return this.prisma.prospect.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { id: true },
    });
  }
  
  private async getProspectsByType(whereClause: any) {
    return this.prisma.prospect.groupBy({
      by: ['type'],
      where: whereClause,
      _count: { id: true },
    });
  }

 private async getTopSalesOfficers(whereClause: any) {
    const salesOfficersCounts = await this.prisma.prospect.groupBy({
      by: ['assignedToId'],
      where: whereClause,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // --- CORRECTION CRUCIALE ---
    // On utilise une fonction de garde de type pour s'assurer que TypeScript sait que 'id' est une chaîne
    const officerIds = salesOfficersCounts
      .map((oc) => oc.assignedToId)
      .filter((id): id is string => id != null);

    if (officerIds.length === 0) return [];

    const officers = await this.prisma.user.findMany({
      where: { id: { in: officerIds } }, // N'a plus d'erreur ici
      select: { id: true, firstName: true, lastName: true },
    });

    return salesOfficersCounts.map((oc) => {
      const officer = officers.find((o) => o.id === oc.assignedToId);
      return {
        ...officer,
        prospectCount: oc._count.id,
      };
    });
  }


  private async getTopCountryManagers(whereClause: any) {
    // On regroupe par pays, puis on trouve le CM associé
    const countryCounts = await this.prisma.prospect.groupBy({
      by: ['country'],
      where: whereClause,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const countryNames = countryCounts.map((cc) => cc.country);

    const managers = await this.prisma.user.findMany({
      where: {
        country: { in: countryNames },
        role: { name: 'COUNTRY_MANAGER' },
      },
      select: { id: true, firstName: true, lastName: true, country: true },
    });

    return countryCounts.map((cc) => {
      const manager = managers.find((m) => m.country === cc.country);
      return {
        ...manager,
        country: cc.country,
        countryName: getName(cc.country) || cc.country, // Utilisation de la bibliothèque
        prospectCount: cc._count.id,
      };
    });
  }
}