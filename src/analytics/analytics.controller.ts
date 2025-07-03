import {
  Controller,
  Get,
  Req,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ROLES } from 'src/auths/decorators/roles.decorator';
import { eROLE } from 'src/common/types/roles.types';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Get personal analytics', description: 'Returns ride stats for customer or driver' })
  @ROLES(eROLE.CUSTOMER, eROLE.DRIVER)
  @Get('/me')
  getOwnAnalytics(@Req() req) {
    const user = req.user;
    if (user.role == 'CUSTOMER')
      return this.analyticsService.getCustomerAnalytics(user.id);
    if (user.role == 'DRIVER')
      return this.analyticsService.getDriverAnalytics(user.id);
  }

  @ApiOperation({ summary: 'Get admin analytics', description: 'Returns global platform stats (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Get('admin')
  getAdminAnalytics() {
    return this.analyticsService.getAdminAnalytics();
  }
}
