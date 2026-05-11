import {
  Controller, Post, Get, Patch, Body, Param, Query,
  HttpCode, HttpStatus, Req, UseGuards,
} from '@nestjs/common';
import { DriverAppService } from './driver-app.service';
import {
  ActivateDto, DriverDetailsDto,
  CreateActivationCodeDto, UpdateActivationCodeDto,
  CreateVehicleRegistrationDto, UpdateVehicleRegistrationDto,
} from './driver-app.dto';
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

@Controller('driver-app')
export class DriverAppController {
  constructor(private readonly driverAppService: DriverAppService) {}

  // ─── Driver App (no JWT needed) ──────────────────────────────────────────

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  activate(@Body() dto: ActivateDto) {
    return this.driverAppService.activate(dto);
  }

  @Get('vehicles')
  getVehicles(@Query('regionId') regionId?: string) {
    return this.driverAppService.getVehicles(regionId);
  }

  @Post('driver-details')
  @HttpCode(HttpStatus.OK)
  submitDriverDetails(@Body() dto: DriverDetailsDto) {
    return this.driverAppService.submitDriverDetails(dto);
  }

  @Get('regions')
  getRegions() {
    return this.driverAppService.getRegions();
  }

  @Get('regions/:regionId/routes')
  getRoutes(@Param('regionId') regionId: string) {
    return this.driverAppService.getRoutesByRegion(regionId);
  }

  @Get('routes/:routeId/departures')
  getDepartures(@Param('routeId') routeId: string, @Query('window') window?: string) {
    return this.driverAppService.getDepartures(routeId, window);
  }
  @Get('routes/:routeId/stop-etas')
  getStopEtas(
    @Param('routeId') routeId: string,
    @Query('departureId') departureId?: string,
  ) {
    return this.driverAppService.getStopEtas(routeId, departureId);
  }
  // ─── Admin endpoints (JWT required) ─────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver_app_manager')
  @Get('activation-codes')
  listActivationCodes(@Req() req: AuthenticatedRequest) {
    return this.driverAppService.listActivationCodes(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver_app_manager')
  @Post('activation-codes')
  createActivationCode(@Body() dto: CreateActivationCodeDto, @Req() req: AuthenticatedRequest) {
    return this.driverAppService.createActivationCode(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver_app_manager')
  @Patch('activation-codes/:id')
  updateActivationCode(
    @Param('id') id: string,
    @Body() dto: UpdateActivationCodeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.driverAppService.updateActivationCode(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver_app_manager')
  @Get('vehicle-registrations')
  listVehicleRegistrations(@Req() req: AuthenticatedRequest) {
    return this.driverAppService.listVehicleRegistrations(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver_app_manager')
  @Post('vehicle-registrations')
  createVehicleRegistration(@Body() dto: CreateVehicleRegistrationDto, @Req() req: AuthenticatedRequest) {
    return this.driverAppService.createVehicleRegistration(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver_app_manager')
  @Patch('vehicle-registrations/:id')
  updateVehicleRegistration(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleRegistrationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.driverAppService.updateVehicleRegistration(id, dto, req.user);
  }
}
