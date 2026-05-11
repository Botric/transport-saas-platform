import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { DeparturesService } from './departures.service';
import { CreateDepartureDto } from './departures.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';

type AuthenticatedRequest = {
  user: {
    id: string;
    role: string;
    organisationId: string | null;
  };
};

@Controller('departures')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('route_manager')
export class DeparturesController {
  constructor(private readonly departuresService: DeparturesService) {}

  @Get('route/:routeId')
  findByRoute(
    @Param('routeId') routeId: string,
    @Query('window') window: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    if (window === 'next-hour') return this.departuresService.findNextHour(routeId, req.user);
    return this.departuresService.findByRoute(routeId, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.departuresService.findOne(id, req.user);
  }

  @Post()
  create(@Body() dto: CreateDepartureDto, @Req() req: AuthenticatedRequest) {
    return this.departuresService.create(dto, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateDepartureDto>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.departuresService.update(id, dto, req.user);
  }
}
