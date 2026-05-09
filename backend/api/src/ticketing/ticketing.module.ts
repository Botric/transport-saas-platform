import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProduct } from '../entities/ticket-product.entity';
import { TicketOrder } from '../entities/ticket-order.entity';
import { Route } from '../entities/route.entity';
import { AuthModule } from '../auth/auth.module';
import { TicketingService } from './ticketing.service';
import { TicketingController } from './ticketing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketProduct, TicketOrder, Route]),
    AuthModule,
  ],
  providers: [TicketingService],
  controllers: [TicketingController],
  exports: [TicketingService],
})
export class TicketingModule {}
