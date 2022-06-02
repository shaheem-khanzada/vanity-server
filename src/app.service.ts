import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk'
import { spawn } from 'child_process';
import {
  normalizeAddressResults,
  normalizeMergeResults,
  normalizeVanityKeys,
} from './helper/normalizeGenerateResults';
import { GenerateKey } from './interfaces/generate.interface';
import { ConfigService } from '@nestjs/config';
import modifyMetaData from './helper/metadata';

const baseUrl = '/home/vanitygen-plusplus';

@Injectable()
export class AppService {
  s3Bucket: AWS.S3;
  constructor(private configService: ConfigService) {
    this.s3Bucket = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });
  }
  async spawnAsync(command: string, args: string[]) {
    const child = spawn(`${baseUrl}/${command}`, args);

    let data = '';
    for await (const chunk of child.stdout) {
      console.log('stdout chunk: ' + chunk);
      data += chunk;
    }
    let error = '';
    for await (const chunk of child.stderr) {
      console.error('stderr chunk: ' + chunk);
      error += chunk;
    }
    const exitCode = await new Promise((resolve) => {
      child.on('close', resolve);
    });

    console.log('exitCode', exitCode);
    console.log('error', error);

    if (exitCode) {
      throw new Error(`subprocess error exit ${exitCode}, ${error}`);
    }
    return data;
  }

  async generateVanityKey(network: string): Promise<GenerateKey> {
    try {
      const data = await this.spawnAsync('keyconv', ['-C', network, '-G']);
      console.log('data', data);
      const keys = normalizeVanityKeys(data.toString());
      console.log('keys', keys);
      return keys;
    } catch (e) {
      console.log('Error generateVanityKey ', e);
      throw new HttpException(
        e.message || 'Error while generating vanity key',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async generateDesireAddress(body: any): Promise<any> {
    try {
      const data = await this.spawnAsync('vanitygen++', [
        '-C',
        body.network,
        '-P',
        body.publicKey,
        body.needle,
      ]);
      const keys = normalizeAddressResults(data.toString());
      console.log('keys', keys);
      return keys;
    } catch (e) {
      console.log('Error generateDesireAddress', e);
      throw new HttpException(
        e.message || 'Error while generating address',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async mergeKeys(body: any): Promise<any> {
    try {
      const data = await this.spawnAsync('keyconv', [
        '-C',
        body.network,
        '-c',
        body.privkeyPart,
        body.vanityKey,
      ]);
      const keys = normalizeMergeResults(data.toString());
      console.log('keys', keys);
      return keys;
    } catch (e) {
      console.log('Error generateDesireAddress', e);
      throw new HttpException(
        e.message || 'Error while merge',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadMetadata(body: { tokenId: string, needle: string, rank: string }) {
    try {
      const params = {
        ContentType: 'application/json',
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: `${body.tokenId}.json`,
        Body: modifyMetaData({
          tokenId: body.tokenId,
          needle: body.needle,
          rank: body.rank,
        }),
      };

      return new Promise((resolve, reject) => {
        this.s3Bucket.upload(params, (error: any, data: any) => {
          if (error) {
            reject(error)
          }
          resolve(data);
        })
      })
      
    } catch (e) {
      throw e;
    }
  }
}
