import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('generate')
  generateVanityKey(@Query('network') network: string): any {
    if (network) {
      console.log('network', network);
      return this.appService.generateVanityKey(network);
    }
    throw new HttpException('network required', HttpStatus.BAD_REQUEST);
  }

  @Post('generateAddress')
  generateDesireAddress(@Body() body: any): any {
    if (Object.keys(body || {}).length) {
      console.log('network', body);
      return this.appService.generateDesireAddress(body);
    } else {
      throw new HttpException('body required', HttpStatus.BAD_REQUEST);
    }
  }
}
