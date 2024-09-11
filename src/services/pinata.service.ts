import { Readable } from "stream";
import { pinata, PINATA_GATEWAY, PINATA_GATEWAY_KEY } from "../config/pinata.config";

export class PinataService {
  private static instance: PinataService;

  private constructor() {}

  public static getInstance(): PinataService {
    if (!PinataService.instance) {
      PinataService.instance = new PinataService();
    }
    return PinataService.instance;
  }

  private getSecureUrl(ipfsHash: string): string {
    return `${PINATA_GATEWAY}/ipfs/${ipfsHash}?pinataGatewayToken=${PINATA_GATEWAY_KEY}`;
  }

  public async uploadToPinata(
    buffer: Buffer,
    folder: string,
    fileName: string
  ): Promise<string> {
    const stream = Readable.from(buffer);
    const options: any = {
      pinataMetadata: {
        name: fileName,
        keyvalues: {
          folder: folder,
        },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    const result = await pinata.pinFileToIPFS(stream, options);
    return `${PINATA_GATEWAY}/ipfs/${result.IpfsHash}`;
    // return this.getSecureUrl(result.IpfsHash);
  }

  public async getFilesByFolder(folder: string): Promise<any[]> {
    const metadataFilter = {
      keyvalues: {
        folder: {
          value: folder,
          op: 'eq'
        }
      }
    };

    const result = await pinata.pinList({
      metadata: metadataFilter,
      status: 'pinned'
    });

    return result.rows;
    // return result.rows.map(file => this.getSecureUrl(file.ipfs_pin_hash));

  }

  public async deleteFile(ipfsHash: string): Promise<void> {
    await pinata.unpin(ipfsHash);
  }
}

export default PinataService.getInstance();