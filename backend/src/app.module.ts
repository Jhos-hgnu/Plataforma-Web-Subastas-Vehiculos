import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from './firebase/firebase.module';
import { HealthController } from './health.controller';
import { VehiclesModule } from './vehicles/vehicles.module';
import { AuctionsModule } from './auctions/auctions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule,
    AuthModule,
    VehiclesModule,
    AuctionsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
