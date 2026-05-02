import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { MoviesModule } from "./movies/movies.module";
import { TheatersModule } from "./theaters/theaters.module";
import { ScreensModule } from "./screens/screens.module";
import { PricingModule } from "./pricing/pricing.module";
import { SeatsModule } from "./seats/seats.module";
import { ShowsModule } from "./shows/shows.module";
import { BookingsModule } from "./bookings/bookings.module";
import { RedisModule } from "./redis/redis.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MoviesModule,
    TheatersModule,
    ScreensModule,
    PricingModule,
    SeatsModule,
    ShowsModule,
    BookingsModule,
    RedisModule,
  ],
})
export class AppModule {}
