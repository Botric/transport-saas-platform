import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './regions.dto';
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

@Controller('regions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('route_manager')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.regionsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.regionsService.findOne(id, req.user);
  }

  @Post()
  create(@Body() dto: CreateRegionDto, @Req() req: AuthenticatedRequest) {
    return this.regionsService.create(dto, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRegionDto>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.regionsService.update(id, dto, req.user);
  }
}
