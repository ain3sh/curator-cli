import { ConfigManager } from '../core/config';
import { CacheManager } from '../core/cache';
import { success, warning, prompt } from '../ui/prompts';

export async function cleanCommand(): Promise<void> {
  const configManager = new ConfigManager();
  const cacheManager = new CacheManager(configManager.getConfigDir());

  const manifest = cacheManager.getAll();
  const count = Object.keys(manifest).length;

  if (count === 0) {
    warning('Cache is already empty');
    return;
  }

  console.log(`This will clear ${count} cached entries.`);
  const confirm = await prompt('Are you sure? (yes/no): ');

  if (confirm.toLowerCase() !== 'yes') {
    console.log('Cancelled');
    return;
  }

  cacheManager.clear();
  success(`Cleared ${count} cached entries`);
}
