import { Readable } from "stream";
import { encode } from "blurhash";
import { Logger } from "pino";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require("sharp"); // Ugly, but necessary because of dependencies Directus

/**
 * Converts a readable stream to a buffer.
 * @param stream The readable stream to convert.
 * @returns A promise that resolves to a buffer containing the data from the stream.
 */
export const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
};

/**
 * Generates a BlurHash string from a readable stream.
 *
 * @param stream - The readable stream to generate the BlurHash from.
 * @returns A Promise that resolves to the generated BlurHash string, or null if an error occurs.
 */
export const generateBlurHashFromStream = async (
  stream: Readable,
  detail_level: string,
  logger: Logger,
): Promise<string | null> => {
  try {
    const buffer = await streamToBuffer(stream);
    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    /**
     * Determine the x and y component counts based on the detail level
     */
    let xComponent = 6; // Default value for medium detail
    let yComponent = 6; // Default value for medium detail

    switch (detail_level) {
      case "low":
        xComponent = 3;
        yComponent = 3;
        break;
      case "high":
        xComponent = 8;
        yComponent = 8;
        break;
    }

    const blurHash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      xComponent,
      yComponent,
    );
    return blurHash;
  } catch (error) {
    logger.error(`Error generating BlurHash: ${error}`);
    return null;
  }
};
