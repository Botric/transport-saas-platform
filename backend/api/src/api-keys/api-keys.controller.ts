import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './api-key.dto';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('api_admin')
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  list(@Req() req: any) {
    return this.apiKeysService.list(req.user);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create(req.user.id, dto, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApiKeyDto, @Req() req: any) {
    return this.apiKeysService.update(id, dto, req.user);
  }

  @Delete(':id')
  revoke(@Param('id') id: string, @Req() req: any) {
    return this.apiKeysService.revoke(id, req.user);
  }
}
