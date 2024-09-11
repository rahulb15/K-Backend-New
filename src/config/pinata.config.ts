// // src/config/pinata.config.ts

// import pinataSDK from "@pinata/sdk";

// export const pinata = new pinataSDK(
//   process.env.PINATA_API_KEY!,
//   process.env.PINATA_API_SECRET!
// );


// src/config/pinata.config.ts

import pinataSDK from "@pinata/sdk";

export const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_API_SECRET!
);

export const PINATA_GATEWAY = process.env.PINATA_CUSTOM_GATEWAY || 'https://gateway.pinata.cloud';
export const PINATA_GATEWAY_KEY = process.env.PINATA_GATEWAY_KEY || 'ipfs';