import { Controller, Post, Delete, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Passenger/driver registers their FCM token after login.
   * Called automatically by the passenger app when it gets a token from FCM.
   */
  @UseGuards(JwtAuthGuard)
  @Post('token')
  registerToken(@Req() req: any, @Body() body: { fcmToken: string }) {
    return this.notificationsService.registerToken(req.user.id, body.fcmToken);
  }

  /**
   * Remove FCM token on logout.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('token')
  removeToken(@Req() req: any) {
    return this.notificationsService.removeToken(req.user.id);
  }
}
