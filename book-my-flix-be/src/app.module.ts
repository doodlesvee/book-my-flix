import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { MoviesModule } from "./movies/movies.module";

@Module({
  imports: [PrismaModule, AuthModule, MoviesModule],
})
export class AppModule {}
