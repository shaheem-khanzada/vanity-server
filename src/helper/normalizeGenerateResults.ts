import { HttpException, HttpStatus } from "@nestjs/common";
import { GenerateKey } from "src/interfaces/generate.interface";

export const normalizeVanityKeys = (stdout: string): GenerateKey => {
    const regex = /Pubkey \(.*?\):\s+(\w+)\nPrivkey \(.*?\):\s+(\w+)\nAddress:\s+(\w+)\nPrivkey:\s+(\w+)/g;
    const match = regex.exec(stdout);
    if (match) {
      const result: GenerateKey = {
        publicKeyHex: match[1],
        privateKeyHex: match[2],
        address: match[3],
        privateKey: match[4]
      }
      return result;
    }
    throw new HttpException('Unable to generate vanity key', HttpStatus.EXPECTATION_FAILED)
}

export const normalizeAddressResults = (stdout: string) => {
  stdout = stdout.replaceAll('ETH ', '');
  stdout = stdout.replaceAll('BTC ', '');
  stdout = stdout.replaceAll('LTC ', '');
  stdout = stdout.replaceAll('DOGE ', '');
  const regex = /Pattern:\s+(\w+)\nAddress:\s+(\w+)\nPrivkeyPart:\s+(\w+)/g;
  const match = regex.exec(stdout);
  if (match) {
    const result = {
      pattern: match[1],  
      address: match[2],
      privkeyPart: match[3]
    }
    return result;
  }
  throw new HttpException('Unable to generate address', HttpStatus.EXPECTATION_FAILED)
}

export const normalizeMergeResults = (stdout: string) => {
  const regex = /Address:\s+(\w+)\nPrivkey:\s+(\w+)/g;
  const match = regex.exec(stdout);
  if (match) {
    const result = {
      address: match[1],
      privateKey: match[2]
    }
    return result;
  }
  throw new HttpException('Unable to merge keys', HttpStatus.EXPECTATION_FAILED)
}