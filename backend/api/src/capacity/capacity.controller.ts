import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CapacityService } from './capacity.service';
import { CapacityUpdateDto } from './capacity.dto';

@Controller('capacity')
export class CapacityController {
  constructor(private readonly capacityService: CapacityService) {}

  @Post('update')
  @HttpCode(HttpStatus.OK)
  update(@Body() dto: CapacityUpdateDto) {
    return this.capacityService.update(dto);
  }

  @Get('sessions/:sessionId')
  getHistory(@Param('sessionId') sessionId: string) {
    return this.capacityService.getSessionCapacityHistory(sessionId);
  }
}
