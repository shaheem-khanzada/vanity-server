import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import S3 from 'aws-sdk/clients/s3';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract } from 'ethers';
import getRemainingTokens from './helper/getRemainingTokens';
import { ORIGINS_ABI, ORIGINS_ADDRESS } from './constants/abi';
import { AppService } from './app.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  s3Bucket: S3;
  constructor(
    private configService: ConfigService,
    private appService: AppService,
    private schedulerRegistry: SchedulerRegistry
  ) {
    this.s3Bucket = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'upload-metadata',
  })
  pushRemainingMetadata() {
    this.logger.debug('Called when the current second is 45');
    this.updateRemainingMetadata();
  }

  listRemainingTokens = (numOfTokens: number) => {
    const params = {
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
    };
    return new Promise((resolve, reject) => {
      this.s3Bucket.listObjectsV2(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(getRemainingTokens(data, numOfTokens));
      });
    });
  };

  stopCronJob() {
    const job = this.schedulerRegistry.getCronJob('upload-metadata');
    job.stop();
  }

  async updateRemainingMetadata() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://bsc-dataseed.binance.org',
      );
      const contract = new Contract(ORIGINS_ADDRESS, ORIGINS_ABI, provider);
      const tokenId = await contract.tokensMinted();
      const tokens: any = await this.listRemainingTokens(tokenId.toNumber());
      if (tokenId.toNumber() === 500 && tokens.length === 0) {
        this.stopCronJob();
      }
      for (let i = 0; i < tokens.length; i++) {
        const nftId = tokens[i];
        const needle = await contract.tokenNeedleMapping(nftId);
        const weight = await contract.needlerMap(needle, nftId);
        const payload = {
          tokenId: nftId.toString(),
          needle,
          rank: (
            (Math.log((1 * 10 ** 18) / weight) / Math.log(0.8)) * -1 +
            1
          ).toFixed(),
        };
        console.log(payload);
        this.appService.uploadMetadata(payload);
      }
    } catch (e) {
      console.log('error', e);
    }
  }
}
