/** The made-up address a project's preview is "published" at, e.g. leave-desk.architect.app. */
export function previewUrl(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${slug || "my-app"}.architect.app`;
}
