import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import normalizeGenerateResults, { normalizeAddressResults } from './helper/normalizeGenerateResults';
import { GenerateKey } from './interfaces/generate.interface';

@Injectable()
export class AppService {
  async spawnAsync(command: string, args: string[]) {
      const child = spawn(command, args);

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
      const data = await this.spawnAsync('/home/vanitygen-plusplus/keyconv', [
        '-C',
        network,
        '-G',
      ]);
      console.log("data", data);
      const keys = normalizeGenerateResults(data.toString());
      console.log('keys', keys);
      return keys;
    } catch (e) {
      console.log('Error generateVanityKey ', e);
      throw new HttpException('body required', HttpStatus.BAD_REQUEST);
    }
  }

  async generateDesireAddress(body: any): Promise<any> {
    try {
      const data = await this.spawnAsync(
        '/home/vanitygen-plusplus/vanitygen++',
        ['-C', body.network, '-P', body.publicKey, body.needle],
      );
      const keys = normalizeAddressResults(data.toString());
      console.log('keys', keys);
      return keys;
    } catch (e) {
      console.log('Error generateDesireAddress', e);
      throw new HttpException(e.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }
}
