import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import S3 from 'aws-sdk/clients/s3';
import { ethers, Contract } from 'ethers';
import { spawn } from 'child_process';
import {
  normalizeAddressResults,
  normalizeMergeResults,
  normalizeVanityKeys,
} from './helper/normalizeGenerateResults';
import { GenerateKey } from './interfaces/generate.interface';
import { ConfigService } from '@nestjs/config';
import modifyMetaData, {
  convertTokeIdToVideoId,
  getIpfsBaseUrl,
} from './helper/metadata';
import { ORIGINS_ABI, ORIGINS_ADDRESS } from './constants/abi';

const baseUrl = '/home/vanitygen-plusplus';

@Injectable()
export class AppService {
  s3Bucket: S3;
  constructor(private configService: ConfigService) {
    this.s3Bucket = new S3({
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

  async uploadMetadata(body: {
    tokenId: string;
    needle: string;
    rank: string;
  }) {
    try {
      const ipfsVideoBaseUrl = getIpfsBaseUrl({ ...body, type: 'video' });
      const ipfsImageBaseUrl = getIpfsBaseUrl({ ...body, type: 'image' });
      const content = modifyMetaData({
        assetUrl: `${ipfsVideoBaseUrl}/${convertTokeIdToVideoId(body)}.mp4`,
        image: `${ipfsImageBaseUrl}/${convertTokeIdToVideoId(body)}.mp4`,
        tokenId: body.tokenId,
        needle: body.needle,
        rank: body.rank,
      });

      const params = {
        ContentType: 'application/json',
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: `${body.tokenId}.json`,
        Body: content,
      };

      return new Promise((resolve, reject) => {
        this.s3Bucket.upload(params, (error: any, data: any) => {
          if (error) {
            console.log('error', error);
            reject(error);
          }
          resolve(data);
          console.log('location', data.Location);
        });
      });
    } catch (e) {
      throw e;
    }
  }

  async updateMetadata() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://bsc-dataseed.binance.org',
      );
      const contract = new Contract(ORIGINS_ADDRESS, ORIGINS_ABI, provider);
      const tokenId = await contract.tokensMinted();
      for (let i = 1; i <= tokenId.toNumber(); i++) {
        const nftId = i;
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
        this.uploadMetadata(payload);
      }
    } catch (e) {
      console.log('error updateMetadata updateMetadata', e);
    }
  }
}
