import {
  Controller, Get, Delete, Post, Patch, Body, Param, Query, Req, Res, Headers,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ReportsService } from './reports.service';

// ── Partner API (API-key authenticated) ──────────────────────────────────────

@Controller('partner')
export class PartnerController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('live/routes')
  async liveRoutes(@Headers('authorization') auth: string) {
    await this.reportsService.requireApiKey(auth, 'live:read');
    return this.reportsService.getLiveRoutes();
  }

  @Get('live/vehicles')
  async liveVehicles(@Headers('authorization') auth: string) {
    await this.reportsService.requireApiKey(auth, 'live:read');
    return this.reportsService.getLiveVehicles();
  }

  @Get('history/sessions')
  async historicalSessions(
    @Headers('authorization') auth: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    await this.reportsService.requireApiKey(auth, 'history:read');
    return this.reportsService.getHistoricalSessions(from, to);
  }

  @Get('export/finance')
  async financeExport(
    @Headers('authorization') auth: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    await this.reportsService.requireApiKey(auth, 'finance:read');
    const csv = await this.reportsService.financeExportCsv(from, to);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="finance-export.csv"');
    res.send(csv);
  }

  @Get('export/tracking')
  async trackingExport(
    @Headers('authorization') auth: string,
    @Query('sessionId') sessionId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    await this.reportsService.requireApiKey(auth, 'tracking:read');
    const csv = await this.reportsService.trackingExportCsv(sessionId, from, to);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tracking-export.csv"');
    res.send(csv);
  }

  @Get('export/gtfs')
  async gtfsExport(
    @Headers('authorization') auth: string,
    @Res() res: Response,
  ) {
    await this.reportsService.requireApiKey(auth, 'live:read');
    const zip = await this.reportsService.getGtfsZip();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="gtfs.zip"');
    res.send(zip);
  }
}

// ── Internal admin (JWT authenticated) ───────────────────────────────────────

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('live/routes')
  liveRoutes() {
    return this.reportsService.getLiveRoutes();
  }

  @Get('live/vehicles')
  liveVehicles() {
    return this.reportsService.getLiveVehicles();
  }

  @Get('history/sessions')
  history(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getHistoricalSessions(from, to);
  }

  @Get('export/finance')
  async financeExport(
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const csv = await this.reportsService.financeExportCsv(from, to);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="finance-export.csv"');
    res.send(csv);
  }

  @Get('export/tracking')
  async trackingExport(
    @Query('sessionId') sessionId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const csv = await this.reportsService.trackingExportCsv(sessionId, from, to);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tracking-export.csv"');
    res.send(csv);
  }

  @Get('export/gtfs')
  async gtfsExport(@Res() res: Response) {
    const zip = await this.reportsService.getGtfsZip();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="gtfs.zip"');
    res.send(zip);
  }

  @Get('audit-logs')
  auditLogs(@Query('limit') limit?: string) {
    return this.reportsService.getAuditLogs(limit ? parseInt(limit, 10) : 200);
  }
}
