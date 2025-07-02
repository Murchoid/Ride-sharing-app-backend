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

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('/me')
  getOwnAnalytics(@Req() req){
    const user = req.user;
    if(user.role == 'CUSTOMER') return this.analyticsService.getCustomerAnalytics(user.id);
    if(user.role == 'DRIVER') return this.analyticsService.getDriverAnalytics(user.id);
  }

  @Get('admin')
  getAdminAnalytics(){
    return this.analyticsService.getAdminAnalytics()
  }
}
