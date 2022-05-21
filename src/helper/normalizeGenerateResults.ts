import { HttpException, HttpStatus } from "@nestjs/common";
import { GenerateKey } from "src/interfaces/generate.interface";

export default (stdout: string): GenerateKey => {
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
    throw new HttpException('Unable to generate key', HttpStatus.EXPECTATION_FAILED)
}

export const normalizeAddressResults = (stdout: string) => {
  stdout = stdout.replaceAll('ETH', '');
  stdout = stdout.replaceAll('BTC', '');
  stdout = stdout.replaceAll('LTC', '');
  stdout = stdout.replaceAll('DOGE', '');
  stdout = stdout.replaceAll('Generating  Address', '');
  const regex = /Pattern:\s+(\w+)\nAddress:\s+(\w+)\nPrivkeyPart:\s+(\w+)/g;
  const match = regex.exec(stdout);
  console.log("match", match);
  console.log("match stdout", stdout);
  if (match) {
    const result = {
      pattern: match[1],  
      address: match[2],
      privkeyPart: match[3]
    }
    return result;
  }
  throw new HttpException('Unable to generate key', HttpStatus.EXPECTATION_FAILED)
}