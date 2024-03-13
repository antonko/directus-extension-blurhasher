import { defineHook } from "@directus/extensions-sdk";
import { runMigration } from "./migration";
import { generateBlurHashFromStream } from "./blurhash";

export default defineHook(
  ({ action, init }, { services, database, getSchema, logger }) => {
    const { AssetsService, ItemsService, FieldsService } = services;
    init("routes.custom.after", async () => {
      logger.info(`[blurhasher]: Initializing extension`);
      const schema = await getSchema();
      const fieldsService = new FieldsService({ knex: database, schema });
      runMigration(fieldsService, logger);
    });

    action("files.upload", async ({ payload, key }, context) => {
      if (
        !["image/jpeg", "image/png", "image/webp", "image/tiff"].includes(
          payload.type,
        )
      ) {
        logger.info("[blurhasher]: The file is not a image - skipped");
        return;
      }

      const serviceOptions = { ...context, knex: context.database };
      const assetsService = new AssetsService(serviceOptions);
      const itemService = new ItemsService("directus_files", {
        knex: database,
        schema: context.schema,
      });

      const { stream } = await assetsService.getAsset(key, {
        transformationParams: {
          quality: 80,
          width: 200,
          fit: "inside",
        },
      });
      generateBlurHashFromStream(stream).then((blurHash) => {
        itemService.updateOne(key, { blurhash: blurHash });
      });
    });
  },
);
