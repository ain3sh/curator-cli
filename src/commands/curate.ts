import { ConfigManager } from '../core/config';
import { CacheManager } from '../core/cache';
import { FirecrawlClient } from '../core/api';
import { sanitizeDirname, writeMarkdownFile, createContentDirectory, downloadImage, getImageFilename } from '../core/file-utils';
import { spinner, success, error, warning, prompt } from '../ui/prompts';
import * as path from 'path';

export interface CurateOptions {
  output?: string;
  name?: string;
  full?: boolean;
  refresh?: boolean;
  media?: boolean;
}

export async function curate(url: string, options: CurateOptions = {}): Promise<void> {
  const configManager = new ConfigManager();
  const cacheManager = new CacheManager(configManager.getConfigDir());

  // Check for API key
  let apiKey = configManager.getApiKey();

  if (!apiKey) {
    warning('No API key found. Let\'s set up curator!');
    console.log();
    apiKey = await prompt('Enter your Firecrawl API key: ');

    if (!apiKey) {
      error('API key is required. Get one at https://firecrawl.dev');
      process.exit(1);
    }

    configManager.save({ apiKey });
    success(`Config saved to ${configManager.getConfigPath()}`);
    console.log();
  }

  // Check cache
  if (!options.refresh && configManager.isCacheEnabled() && cacheManager.has(url)) {
    const cached = cacheManager.get(url)!;
    success(`Already cached: ${cached.title}`);
    success(`Location: ${path.join(cached.outputPath, 'CONTENT.md')}`);
    return;
  }

  // Fetch from Firecrawl
  const client = new FirecrawlClient(apiKey);
  const stop = spinner('Fetching content...');

  // Determine formats to request
  const formats = ['markdown'];
  if (options.media) {
    formats.push('images');
  }

  const result = await client.scrape({
    url,
    formats,
    onlyMainContent: !options.full
  });

  stop();

  if (!result.success) {
    error(result.error || 'Failed to fetch content');
    process.exit(1);
  }

  // Get metadata
  const title = result.metadata?.title || 'Untitled';
  const description = result.metadata?.description;
  const markdown = result.markdown || '';

  success(`Fetched: "${title}"`);

  // Determine output location - now using directory structure
  const outputDir = options.output || configManager.getDefaultOutputDir();
  const dirname = options.name || sanitizeDirname(title, url);
  const contentDir = createContentDirectory(outputDir, dirname);
  const outputPath = path.join(contentDir, 'CONTENT.md');

  // Write file
  writeMarkdownFile(outputPath, markdown, {
    url,
    title,
    description,
    fetched: new Date().toISOString()
  });

  success(`Saved to: ${outputPath}`);

  // Download images if media flag is set
  if (options.media && result.images && result.images.length > 0) {
    const imageCount = result.images.length;
    console.log(`\nDownloading ${imageCount} image${imageCount > 1 ? 's' : ''}...`);

    // Download images in parallel for efficiency
    const downloadPromises = result.images.map((image, index) => {
      const position = image.position || index + 1;
      const filename = getImageFilename(image.imageUrl, position);
      const imagePath = path.join(contentDir, filename);

      return downloadImage(image.imageUrl, imagePath)
        .then(() => ({ success: true, filename }))
        .catch((err: any) => ({ success: false, error: err.message }));
    });

    const results = await Promise.all(downloadPromises);
    const downloaded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    if (downloaded > 0) {
      success(`Downloaded ${downloaded} image${downloaded > 1 ? 's' : ''}`);
    }
    if (failed > 0) {
      warning(`Failed to download ${failed} image${failed > 1 ? 's' : ''}`);
    }
  }

  // Update cache
  if (configManager.isCacheEnabled()) {
    cacheManager.set(url, {
      filename: dirname,
      title,
      fetched: new Date().toISOString(),
      outputPath: contentDir,
      hash: cacheManager.hash(markdown)
    });
  }
}
