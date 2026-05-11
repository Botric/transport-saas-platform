import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

// Lazy-load firebase-admin so the app starts without FIREBASE_SERVICE_ACCOUNT_BASE64
let firebaseAdmin: typeof import('firebase-admin') | null = null;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private isEnabled = false;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    const base64 = config.get<string>('FIREBASE_SERVICE_ACCOUNT_BASE64');
    if (!base64) {
      this.logger.warn(
        'FIREBASE_SERVICE_ACCOUNT_BASE64 not set — push notifications disabled.',
      );
      return;
    }

    try {
      const admin = require('firebase-admin') as typeof import('firebase-admin');
      if (!admin.apps.length) {
        const serviceAccount = JSON.parse(
          Buffer.from(base64, 'base64').toString('utf-8'),
        );
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
      firebaseAdmin = admin;
      this.isEnabled = true;
      this.logger.log('Firebase Admin initialised — push notifications enabled');
    } catch (err) {
      this.logger.error('Failed to initialise Firebase Admin:', err);
    }
  }

  /** Register or update the FCM device token for a user */
  async registerToken(userId: string, fcmToken: string) {
    await this.userRepo.update(userId, { fcmToken });
    return { registered: true };
  }

  /** Remove FCM token (called on logout) */
  async removeToken(userId: string) {
    await this.userRepo.update(userId, { fcmToken: null as any });
    return { removed: true };
  }

  /** Send a push notification to a specific user by userId */
  async sendToUser(
    userId: string,
    notification: { title: string; body: string; data?: Record<string, string> },
  ) {
    if (!this.isEnabled || !firebaseAdmin) return;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user?.fcmToken) return;

    await this.sendToToken(user.fcmToken, notification);
  }

  /** Send a push notification to multiple users by userIds */
  async sendToUsers(
    userIds: string[],
    notification: { title: string; body: string; data?: Record<string, string> },
  ) {
    if (!this.isEnabled || !firebaseAdmin) return;

    const users = await this.userRepo
      .createQueryBuilder('u')
      .select('u.fcmToken')
      .where('u.id IN (:...ids)', { ids: userIds })
      .andWhere('u.fcm_token IS NOT NULL')
      .getRawMany();

    const tokens: string[] = users.map((u) => u.u_fcm_token).filter(Boolean);
    if (!tokens.length) return;

    await Promise.allSettled(
      tokens.map((token) => this.sendToToken(token, notification)),
    );
  }

  /** Send a push to all active users on a specific route */
  async notifyRoutePassengers(
    routeId: string,
    notification: { title: string; body: string; data?: Record<string, string> },
  ) {
    if (!this.isEnabled || !firebaseAdmin) return;
    // Future: query ticket orders for routeId and send to those user IDs
    this.logger.log(`Route notification for ${routeId}: ${notification.title}`);
  }

  private async sendToToken(
    token: string,
    notification: { title: string; body: string; data?: Record<string, string> },
  ) {
    if (!firebaseAdmin) return;
    try {
      await firebaseAdmin.messaging().send({
        token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data ?? {},
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      });
    } catch (err: any) {
      // If the token is invalid/expired, clear it
      if (err?.code === 'messaging/registration-token-not-registered') {
        await this.userRepo
          .createQueryBuilder()
          .update(User)
          .set({ fcmToken: null as any })
          .where('fcm_token = :token', { token })
          .execute();
      } else {
        this.logger.warn(`FCM send failed: ${err?.message}`);
      }
    }
  }
}
