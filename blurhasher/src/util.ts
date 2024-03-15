/**
 * Retrieves a setting value from a service.
 * @param service - The service to retrieve the setting from.
 * @param field - The name of the setting field.
 * @returns The value of the setting, or null if not found.
 */
export async function getSetting(service: any, field: string) {
  const found = await service
    .readSingleton({ fields: [field] })
    .catch(() => false);

  return !found ? null : found[field];
}
