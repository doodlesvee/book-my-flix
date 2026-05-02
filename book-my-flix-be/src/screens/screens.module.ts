import { Module } from "@nestjs/common";
import { ScreensController } from "./screens.controller";
import { ScreensService } from "./screens.service";
import { AuthModule } from "../auth/auth.module";
import { SeatsModule } from "../seats/seats.module";

@Module({
  imports: [AuthModule, SeatsModule],
  controllers: [ScreensController],
  providers: [ScreensService],
})
export class ScreensModule {}
