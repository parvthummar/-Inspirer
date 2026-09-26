function appSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return slug || "my-app";
}

/** Where every build is published for trying out, e.g. leave-desk-preview.architect.app. */
export function previewUrl(name: string): string {
  return `${appSlug(name)}-preview.architect.app`;
}

/** The default production address, before a custom domain is added, e.g. leave-desk.architect.app. */
export function productionUrl(name: string): string {
  return `${appSlug(name)}.architect.app`;
}
