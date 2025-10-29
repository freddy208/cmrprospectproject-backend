/* eslint-disable no-unused-vars */
import { Controller, Get, Req, UseGuards, Param, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Generic endpoint -> returns dashboard based on logged user role
  @Get()
  async getMyDashboard(@Req() req: any) {
    const user = req.user as { id: string; role: string; country?: string };

    switch (user.role) {
      case 'DIRECTEUR_GENERAL':
        return this.dashboardService.getGeneralDashboard();

      case 'COUNTRY_MANAGER':
        if (!user.country)
          throw new Error('Country not assigned to COUNTRY_MANAGER');
        return this.dashboardService.getCountryDashboard(user.country);

      case 'SALES_OFFICER':
        return this.dashboardService.getSalesOfficerDashboard(user.id);

      default:
        throw new Error('Role not supported for dashboard');
    }
  }

  // --- Directeur endpoints (global KPIs) ---
  @Get('admin')
  @Roles('DIRECTEUR_GENERAL')
  async adminDashboard() {
    return this.dashboardService.getGeneralDashboard();
  }

  @Get('admin/pipeline-by-channel')
  @Roles('DIRECTEUR_GENERAL')
  async pipelineByChannel(@Query('country') country?: string) {
    return this.dashboardService.pipelineByChannel(country);
  }

  @Get('admin/conversion-rate')
  @Roles('DIRECTEUR_GENERAL')
  async adminConversionRate(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('country') country?: string,
  ) {
    const s = start ? new Date(start) : undefined;
    const e = end ? new Date(end) : undefined;
    return this.dashboardService.conversionRate(s, e, country);
  }

  // --- Country manager endpoints ---
  @Get('country/:country')
  @Roles('DIRECTEUR_GENERAL', 'COUNTRY_MANAGER')
  async countryDashboard(@Param('country') country: string) {
    return this.dashboardService.getCountryDashboard(country);
  }

  // --- Sales endpoints ---
  @Get('sales/:userId')
  @Roles('DIRECTEUR_GENERAL', 'COUNTRY_MANAGER')
  async salesDashboardByUser(@Param('userId') userId: string) {
    return this.dashboardService.getSalesOfficerDashboard(userId);
  }
}
