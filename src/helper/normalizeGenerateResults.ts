import { GenerateKey } from "src/interfaces/generate.interface";

export default (stdout: string): GenerateKey => {
    const regix = /Pubkey \(.*?\):\s+(\w+)\nPrivkey \(.*?\):\s+(\w+)\nAddress:\s+(\w+)\nPrivkey:\s+(\w+)/g;
    const match = regix.exec(stdout);
    const result: GenerateKey = {
      publicKeyHex: match[1],
      privateKeyHex: match[2],
      address: match[3],
      privateKey: match[4]
    }
    return result;
}