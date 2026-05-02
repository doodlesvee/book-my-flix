import { Module } from '@nestjs/common';
import { TheatersController } from './theaters.controller';
import { TheatersService } from './theaters.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TheatersController],
  providers: [TheatersService]
})
export class TheatersModule {}
