export const blurhashField = {
  collection: "directus_files",
  field: "blurhash",
  type: "string",
  meta: null,
  schema: {
    name: "blurhash",
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runMigration(fieldsService: any, logger: any) {
  const found = await fieldsService
    .readOne(blurhashField.collection, blurhashField.field)
    .catch(() => false);
  if (!found) {
    logger.warn(`[blurhasher]: Running migrations...`);
    await fieldsService.createField(blurhashField.collection, blurhashField);
    logger.warn(`[blurhasher]: Migration done`);
  }
}
