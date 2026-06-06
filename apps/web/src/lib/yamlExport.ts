function sanitizeFilenamePart(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (normalized.length === 0) {
    return "screenplay-draft";
  }

  return normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "screenplay-draft";
}

export function getYamlExportFilename(title: string): string {
  return `${sanitizeFilenamePart(title)}.yaml`;
}

export function downloadYamlFile(filename: string, yamlText: string) {
  const blob = new Blob([yamlText], { type: "application/yaml;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = downloadUrl;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.append(anchor);

  try {
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
  }
}
