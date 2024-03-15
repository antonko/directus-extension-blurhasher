import { Logger } from "pino";
import type { FieldRaw } from "@directus/types";
import {
  directus_files_blurhash,
  settings_detail_level,
  settings_regenerate,
} from "./fields";

export async function runMigration(fieldsService: any, logger: Logger) {
  await ensureField(fieldsService, directus_files_blurhash, logger);
  await ensureField(fieldsService, settings_detail_level, logger);
  await ensureField(fieldsService, settings_regenerate, logger);
}

export async function ensureField(
  fieldsService: any,
  field: FieldRaw,
  logger: Logger,
) {
  const found = await fieldsService
    .readOne(field.collection, field.field)
    .catch(() => false);
  if (!found) {
    logger.warn(
      `[blurhasher]: Creating field ${field.collection}.${field.field}`,
    );
    await fieldsService.createField(field.collection, field);
    logger.warn(
      `[blurhasher]: Field ${field.collection}.${field.field} created`,
    );
  }
}
