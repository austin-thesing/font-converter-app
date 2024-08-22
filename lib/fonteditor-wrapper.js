let fonteditor;

export async function initFontEditor() {
  if (!fonteditor) {
    fonteditor = await import("fonteditor-core");
  }
  return fonteditor;
}
