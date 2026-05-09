import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DeparturesService } from './departures.service';
import { CreateDepartureDto } from './departures.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('departures')
@UseGuards(JwtAuthGuard)
export class DeparturesController {
  constructor(private readonly departuresService: DeparturesService) {}

  @Get('route/:routeId')
  findByRoute(@Param('routeId') routeId: string, @Query('window') window?: string) {
    if (window === 'next-hour') return this.departuresService.findNextHour(routeId);
    return this.departuresService.findByRoute(routeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departuresService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDepartureDto) {
    return this.departuresService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateDepartureDto>) {
    return this.departuresService.update(id, dto);
  }
}
