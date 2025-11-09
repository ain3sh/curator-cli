import { ConfigManager } from '../core/config';
import { CacheManager } from '../core/cache';
import { info, warning } from '../ui/prompts';

export function listCommand(): void {
  const configManager = new ConfigManager();
  const cacheManager = new CacheManager(configManager.getConfigDir());

  const manifest = cacheManager.getAll();
  const urls = Object.keys(manifest);

  if (urls.length === 0) {
    warning('No cached content yet');
    console.log();
    info('Use: curate <url> to fetch and cache content');
    return;
  }

  console.log(`Cached content (${urls.length} items):`);
  console.log();

  urls.forEach((url, index) => {
    const entry = manifest[url];
    console.log(`${index + 1}. ${entry.title}`);
    console.log(`   URL: ${url}`);
    console.log(`   File: ${entry.filename}`);
    console.log(`   Fetched: ${new Date(entry.fetched).toLocaleString()}`);
    console.log();
  });
}
