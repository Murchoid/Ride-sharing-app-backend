import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiGeminiService } from './ai-gemini.service';
import { BookingsModule } from 'src/bookings/bookings.module';
import { DistanceService } from 'src/distance/distance.service';

@Module({
  imports: [BookingsModule],
  controllers: [AiController],
  providers: [AiService, AiGeminiService, DistanceService],
})
export class AiModule {}
