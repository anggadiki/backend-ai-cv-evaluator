// src/utils/pdfExtractor.js
import fs from "fs/promises";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractText(file) {
  if (!file) return null;

  try {
    // baca file & convert Buffer → Uint8Array
    const buffer = await fs.readFile(file.path);
    const data = new Uint8Array(buffer);

    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }

    return text.trim() || "[Empty PDF content]";
  } catch (err) {
    console.error("PDF extraction failed:", err.message);
    return `[PDF extraction failed: ${err.message}]`;
  }
}
