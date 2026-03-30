import { APP_NAME } from "../data/config.js";
import { validateImportPayload } from "./content-validator.js";
import { normalizeProfile } from "../storage.js";

export function exportProfileToJson(profile) {
  return JSON.stringify(
    {
      app: APP_NAME,
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      profile: normalizeProfile(profile),
    },
    null,
    2,
  );
}

export function importProfileFromJson(jsonText) {
  let parsed;

  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    return {
      ok: false,
      errors: ["Import text is not valid JSON."],
      warnings: [],
      profile: null,
    };
  }

  const validation = validateImportPayload(parsed);
  if (validation.errors.length > 0) {
    return {
      ok: false,
      errors: validation.errors,
      warnings: validation.warnings,
      profile: null,
    };
  }

  return {
    ok: true,
    errors: [],
    warnings: validation.warnings,
    profile: normalizeProfile(validation.profile),
  };
}
