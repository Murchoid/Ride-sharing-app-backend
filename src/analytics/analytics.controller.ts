import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { ROLES } from 'src/auths/decorators/roles.decorator';
import { eROLE } from 'src/common/types/roles.types';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ROLES(eROLE.CUSTOMER, eROLE.DRIVER)
  @Get('/me')
  getOwnAnalytics(@Req() req) {
    const user = req.user;
    if (user.role == 'CUSTOMER')
      return this.analyticsService.getCustomerAnalytics(user.id);
    if (user.role == 'DRIVER')
      return this.analyticsService.getDriverAnalytics(user.id);
  }

  @ROLES(eROLE.ADMIN)
  @Get('admin')
  getAdminAnalytics() {
    return this.analyticsService.getAdminAnalytics();
  }
}
