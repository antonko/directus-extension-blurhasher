import { Readable } from "stream";
import { encode } from "blurhash";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require("sharp");

export const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
};

export const generateBlurHashFromStream = async (
  stream: Readable,
): Promise<string | null> => {
  try {
    const buffer = await streamToBuffer(stream);
    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const blurHash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      4,
    );
    return blurHash;
  } catch (error) {
    console.error("[blurhasher]: Error generating blurhash", error);
    return null;
  }
};
