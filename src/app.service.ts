import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { normalizeAddressResults, normalizeMergeResults, normalizeVanityKeys } from './helper/normalizeGenerateResults';
import { GenerateKey } from './interfaces/generate.interface';

const baseUrl = '/home/vanitygen-plusplus';

@Injectable()
export class AppService {
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

      console.log("exitCode", exitCode)
      console.log("error", error)

      if (exitCode) {
        throw new Error(`subprocess error exit ${exitCode}, ${error}`);
      }
      return data;
  }

  async generateVanityKey(network: string): Promise<GenerateKey> {
    try {
      const data = await this.spawnAsync('keyconv', [
        '-C',
        network,
        '-G',
      ]);
      console.log("data", data);
      const keys = normalizeVanityKeys(data.toString());
      console.log('keys', keys);
      return keys;
    } catch (e) {
      console.log('Error generateVanityKey ', e);
      throw new HttpException(e.message || 'Error while generating vanity key', HttpStatus.BAD_REQUEST);
    }
  }

  async generateDesireAddress(body: any): Promise<any> {
    try {
      const data = await this.spawnAsync(
        'vanitygen++',
        ['-C', body.network, '-P', body.publicKey, body.needle],
      );
      const keys = normalizeAddressResults(data.toString());
      console.log('keys', keys);
      return keys;
    } catch (e) {
      console.log('Error generateDesireAddress', e);
      throw new HttpException(e.message || 'Error while generating address', HttpStatus.BAD_REQUEST);
    }
  }

  async mergeKeys(body: any): Promise<any> {
    try {
      const data = await this.spawnAsync(
        'keyconv',
        [body.privkeyPart, body.privkeyKey],
      );
      const keys = normalizeMergeResults(data.toString());
      console.log('keys', keys);
      return keys;
    } catch (e) {
      console.log('Error generateDesireAddress', e);
      throw new HttpException(e.message || 'Error while merge', HttpStatus.BAD_REQUEST);
    }
  }
}
