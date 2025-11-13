import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

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

  return filename;
}

export function sanitizeDirname(title: string, url: string): string {
  return sanitizeFilename(title, url);
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

export function createContentDirectory(baseDir: string, dirName: string): string {
  const contentDir = path.resolve(process.cwd(), baseDir, dirName);
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
  return contentDir;
}

export function ensureDirectory(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function resolveOutputPath(outputDir: string, filename: string): string {
  return path.resolve(process.cwd(), outputDir, filename);
}

export async function downloadImage(imageUrl: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http;

    protocol.get(imageUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, outputPath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlinkSync(outputPath);
        reject(err);
      });
    }).on('error', reject);
  });
}

export function getImageFilename(imageUrl: string, position: number): string {
  try {
    const urlObj = new URL(imageUrl);
    const pathname = urlObj.pathname;
    const filename = path.basename(pathname);

    // Extract extension
    const ext = path.extname(filename);
    const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];

    if (ext && validExts.includes(ext.toLowerCase())) {
      // Use original filename if it has a valid extension
      return filename;
    }

    // Fallback to position-based naming with .png default
    return `image-${position}.png`;
  } catch {
    return `image-${position}.png`;
  }
}
