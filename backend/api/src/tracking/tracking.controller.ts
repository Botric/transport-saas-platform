import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { CreateTrackingPointDto } from './tracking.dto';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('points')
  @HttpCode(HttpStatus.OK)
  addPoint(@Body() dto: CreateTrackingPointDto) {
    return this.trackingService.addPoint(dto);
  }

  @Get('sessions/:sessionId/points')
  getPoints(@Param('sessionId') sessionId: string) {
    return this.trackingService.getSessionPoints(sessionId);
  }
}
