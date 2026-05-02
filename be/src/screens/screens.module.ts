import { Module } from "@nestjs/common";
import { ScreensController } from "./screens.controller";
import { ScreensService } from "./screens.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [ScreensController],
  providers: [ScreensService],
})
export class ScreensModule {}
