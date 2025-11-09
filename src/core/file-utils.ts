import * as fs from 'fs';
import * as path from 'path';

export function sanitizeFilename(title: string, url: string): string {
  // Try to use title first, fallback to URL
  let filename = title || extractFilenameFromUrl(url);

  // Convert to lowercase and replace spaces with hyphens
  filename = filename
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/[^a-z0-9-]/g, '')     // Remove special chars
    .replace(/-+/g, '-')            // Multiple hyphens to single
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens

  // Ensure reasonable length
  if (filename.length > 100) {
    filename = filename.substring(0, 100);
  }

  // Fallback if empty
  if (!filename) {
    filename = 'untitled-' + Date.now();
  }

  return filename + '.md';
}

function extractFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.replace(/^\/|\/$/g, '');

    if (pathname) {
      const parts = pathname.split('/');
      const lastPart = parts[parts.length - 1].replace(/\.[^.]+$/, ''); // Remove extension
      return lastPart || urlObj.hostname;
    }

    return urlObj.hostname;
  } catch {
    return 'untitled';
  }
}

export function writeMarkdownFile(
  outputPath: string,
  content: string,
  metadata: {
    url: string;
    title: string;
    description?: string;
    fetched: string;
  }
): void {
  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Build frontmatter
  const frontmatter = [
    '---',
    `url: ${metadata.url}`,
    `title: ${metadata.title}`,
    ...(metadata.description ? [`description: ${metadata.description}`] : []),
    `fetched: ${metadata.fetched}`,
    '---',
    ''
  ].join('\n');

  // Write file
  fs.writeFileSync(outputPath, frontmatter + content, 'utf-8');
}

export function ensureDirectory(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function resolveOutputPath(outputDir: string, filename: string): string {
  return path.resolve(process.cwd(), outputDir, filename);
}
