import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './routes.dto';
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

@Controller('routes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('route_manager')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.routesService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.routesService.findOne(id, req.user);
  }

  @Post()
  create(@Body() dto: CreateRouteDto, @Req() req: AuthenticatedRequest) {
    return this.routesService.create(dto, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRouteDto>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.routesService.update(id, dto, req.user);
  }
}
