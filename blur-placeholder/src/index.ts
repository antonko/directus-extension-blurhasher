import { defineHook } from "@directus/extensions-sdk";

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
    const { AssetsService, FieldsService } = services;
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

	  console.log("payload", payload);
	  console.log("key", key);
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
	  console.log("stream", stream)
	  console.log("key", key)
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
