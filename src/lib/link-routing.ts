const NATIVE_DOCUMENT_EXTENSIONS = [".txt"];

export function shouldUseNativeDocumentNavigation(href: string | undefined): boolean {
  if (!href) return false;

  try {
    const pathname = new URL(href, "https://docs.invalid").pathname.toLowerCase();
    return NATIVE_DOCUMENT_EXTENSIONS.some((extension) => pathname.endsWith(extension));
  } catch {
    return false;
  }
}
