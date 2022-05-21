import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
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

  @Get('generateAddress')
  generateDesireAddress(@Body() body: any): any {
    if (body) {
      console.log('network', body);
      return this.appService.generateDesireAddress(body);
    }
    throw new HttpException('body required', HttpStatus.BAD_REQUEST);
  }
}
