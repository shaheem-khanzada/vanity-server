import { Injectable } from '@nestjs/common';
import { spawnSync } from 'child_process';
import normalizeGenerateResults from './helper/normalizeGenerateResults';
import { GenerateKey } from './interfaces/generate.interface';

@Injectable()
export class AppService {
  generateVanityKey(network: string): GenerateKey {
    const { stdout } = spawnSync('/home/vanitygen-plusplus/keyconv', ['-C', network, '-G'], {
      encoding: 'utf8',
    });
    return normalizeGenerateResults(stdout);
  }
}
