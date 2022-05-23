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

  @Get('vanity')
  generateVanityKey(@Query('network') network: string): any {
    if (network) {
      console.log('network', network);
      return this.appService.generateVanityKey(network);
    }
    throw new HttpException('network required', HttpStatus.BAD_REQUEST);
  }

  @Post('vanity-address')
  generateDesireAddress(@Body() body: any): any {
    return this.appService.generateDesireAddress(body);
  }

  @Post('vanity-merge')
  generateMergeKeys(@Body() body: any): any {
    return this.appService.mergeKeys(body);
  }
}
