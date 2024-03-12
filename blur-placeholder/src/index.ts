import { defineHook } from "@directus/extensions-sdk";
import { encode } from "blurhash";
import { Readable } from "stream";

const sharp = require("sharp");

// Функция для чтения потока и преобразования его в Buffer
const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
};

// Функция для получения данных изображения и генерации blurhash
const generateBlurHashFromStream = async (
  stream: Readable
): Promise<string | null> => {
  try {
    // Преобразование потока в Buffer
    const buffer = await streamToBuffer(stream);
    // Использование sharp для преобразования Buffer в Uint8ClampedArray
    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Генерация blurhash
    const blurHash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      4
    );
    return blurHash;
  } catch (error) {
    console.error("Ошибка при генерации blurhash:", error);
    return null;
  }
};

const placeholderField = {
  collection: "directus_files",
  field: "plur_placeholder",
  type: "string",
  meta: null,
  schema: {
    name: "plur_placeholder",
    table: "directus_files",
    data_type: "varchar",
    default_value: null,
    max_length: 255,
    numeric_precision: null,
    numeric_scale: null,
    is_generated: false,
    generation_expression: null,
    is_nullable: true,
    is_unique: false,
    is_primary_key: false,
    has_auto_increment: false,
    foreign_key_column: null,
    foreign_key_table: null,
  },
};

export default defineHook(
  ({ action, init }, { services, database, getSchema, logger }) => {
    const { AssetsService, ItemsService, FieldsService } = services;
    init("routes.custom.after", async () => {
      logger.info(`[blur-placeholder]: Initializing extension`);
      const schema = await getSchema();
      const fieldsService = new FieldsService({ knex: database, schema });
      const found = await fieldsService
        .readOne(placeholderField.collection, placeholderField.field)
        .catch(() => false);
      if (!found) {
        logger.warn(`[blur-placeholder]: Running migrations...`);
        await fieldsService.createField(
          placeholderField.collection,
          placeholderField
        );
        logger.warn(`[blur-placeholder]: Done`);
      }
    });

    action("files.upload", async ({ payload, key }, context) => {
      const serviceOptions = { ...context, knex: context.database };
      const assetsService = new AssetsService(serviceOptions);
      const itemService = new ItemsService("directus_files", {
        knex: database,
        schema: context.schema,
      });

      const transform = getTransformation(payload.type, 80, 200);
      if (transform == undefined) {
        logger.info("[blur-placeholder]: The file is not a image - skipped");
      }
      const { stream, stat } = await assetsService.getAsset(key, {
        transformationParams: {
          quality: 80,
          width: 200,
          fit: "inside",
        },
      });
      generateBlurHashFromStream(stream).then((blurHash) => {
        console.log("BlurHash:", blurHash);
        itemService.updateOne(key, { plur_placeholder: blurHash });
      });
    });
  }
);

function getTransformation(type: string, quality: number, width: number) {
  if (!["image/jpeg", "image/png", "image/webp", "image/tiff"].includes(type)) {
    return;
  }

  return {
    transformationParams: {
      quality,
      width: width,
      fit: "inside",
    },
  };
}
