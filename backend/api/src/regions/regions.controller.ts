import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './regions.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('regions')
@UseGuards(JwtAuthGuard)
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  findAll() {
    return this.regionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regionsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRegionDto) {
    return this.regionsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateRegionDto>) {
    return this.regionsService.update(id, dto);
  }
}
