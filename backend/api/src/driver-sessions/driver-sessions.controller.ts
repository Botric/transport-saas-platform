import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { DriverSessionsService } from './driver-sessions.service';
import { CreateDriverSessionDto } from './driver-sessions.dto';

@Controller('driver-sessions')
export class DriverSessionsController {
  constructor(private readonly sessionsService: DriverSessionsService) {}

  @Post()
  create(@Body() dto: CreateDriverSessionDto) {
    return this.sessionsService.create(dto);
  }

  @Get()
  findActive() {
    return this.sessionsService.findActiveSessions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  end(@Param('id') id: string) {
    return this.sessionsService.end(id);
  }
}
