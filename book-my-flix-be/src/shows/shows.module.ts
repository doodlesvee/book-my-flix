import { Module } from "@nestjs/common";
import { ShowsController } from "./shows.controller";
import { ShowsService } from "./shows.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [ShowsController],
  providers: [ShowsService],
})
export class ShowsModule {}
