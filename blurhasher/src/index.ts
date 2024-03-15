import { defineHook } from "@directus/extensions-sdk";
import { runMigration } from "./migration";
import { generateBlurHashFromStream } from "./blurhash";
import { getSetting } from "./util";
import { settings_detail_level, settings_regenerate } from "./fields";
import { regenerate_all_images } from "./regenerate";

export default defineHook(
  ({ action, init }, { services, database, getSchema, logger }) => {
    const { AssetsService, ItemsService, FieldsService, SettingsService } =
      services;

    /**
     * Extension initialization hook.
     * This hook is called when the extension is loaded.
     **/
    init("routes.custom.after", async () => {
      logger.info(`[blurhasher]: Initializing extension`);
      const schema = await getSchema();
      const fieldsService = new FieldsService({ knex: database, schema });
      /**
       * Migration
       */
      await runMigration(fieldsService, logger);

      const settings = new SettingsService({ schema, knex: database });
      const detail_level = await getSetting(
        settings,
        settings_detail_level.field,
      );
      const is_regenerate = await getSetting(
        settings,
        settings_regenerate.field,
      );
      if (!is_regenerate) {
        return;
      }
      /**
       * Regenerate all blurhashes if the setting is enabled.
       */
      try {
        logger.warn("[blurhasher]: Regenerating blurhashes");

        const itemsService = new ItemsService("directus_files", {
          knex: database,
          schema: schema,
        });
        const assetsService = new AssetsService({
          knex: database,
          schema: schema,
        });
        await regenerate_all_images(
          itemsService,
          assetsService,
          detail_level,
          logger,
        );
        logger.warn("[blurhasher]: Regeneration complete");
      } catch (error) {
        logger.error(
          `[blurhasher]: An error occurred while regenerating blurhashes: ${error}`,
        );
      } finally {
        settings.upsertSingleton({ blurhasher_regenerate_on_restart: false });
      }
    });

    /**
     * Action hook for the `files.upload` action.
     * This hook is called when a file is uploaded to Directus.
     */
    action("files.upload", async ({ payload, key }, context) => {
      if (
        !["image/jpeg", "image/png", "image/webp", "image/tiff"].includes(
          payload.type,
        )
      ) {
        // Skip non-image files
        return;
      }

      const assetsService = new AssetsService({
        ...context,
        knex: context.database,
      });

      const itemsService = new ItemsService("directus_files", {
        knex: database,
        schema: context.schema,
      });

      const { stream } = await assetsService.getAsset(key, {
        transformationParams: {
          quality: 80,
          width: 100,
          fit: "inside",
        },
      });

      const settings = new SettingsService({
        schema: context.schema,
        knex: database,
      });
      const detail_level = await getSetting(
        settings,
        settings_detail_level.field,
      );

      /**
       * Generate the blurhash from the stream and update the item.
       */
      const blurHash: string | null = await generateBlurHashFromStream(
        stream,
        detail_level,
        logger,
      );
      itemsService.updateOne(key, { blurhash: blurHash });
    });
  },
);
