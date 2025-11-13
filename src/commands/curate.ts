import { ConfigManager } from '../core/config';
import { CacheManager } from '../core/cache';
import { FirecrawlClient } from '../core/api';
import { sanitizeDirname, writeMarkdownFile, createContentDirectory } from '../core/file-utils';
import { spinner, success, error, warning, prompt } from '../ui/prompts';
import * as path from 'path';

export interface CurateOptions {
  output?: string;
  name?: string;
  full?: boolean;
  refresh?: boolean;
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

  const result = await client.scrape({
    url,
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
