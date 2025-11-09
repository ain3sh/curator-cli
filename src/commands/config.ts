import { ConfigManager } from '../core/config';
import { prompt, success, info } from '../ui/prompts';

export async function configCommand(): Promise<void> {
  const configManager = new ConfigManager();
  const currentConfig = configManager.get();

  console.log('Current configuration:');
  console.log();
  info(`Config file: ${configManager.getConfigPath()}`);
  console.log();

  // API Key
  console.log(`Current API key: ${currentConfig.apiKey ? '***' + currentConfig.apiKey.slice(-4) : '(not set)'}`);
  const newApiKey = await prompt('Enter new API key (or press Enter to keep current): ');

  // Default output directory
  const currentDir = currentConfig.defaultOutputDir || './context';
  console.log();
  console.log(`Current output directory: ${currentDir}`);
  const newDir = await prompt('Enter new output directory (or press Enter to keep current): ');

  // Cache enabled
  const currentCache = currentConfig.cacheEnabled !== false;
  console.log();
  console.log(`Cache enabled: ${currentCache ? 'yes' : 'no'}`);
  const newCache = await prompt('Enable cache? (yes/no, or press Enter to keep current): ');

  // Save configuration
  const updates: any = {};

  if (newApiKey) {
    updates.apiKey = newApiKey;
  }

  if (newDir) {
    updates.defaultOutputDir = newDir;
  }

  if (newCache) {
    updates.cacheEnabled = newCache.toLowerCase() === 'yes';
  }

  if (Object.keys(updates).length > 0) {
    configManager.save(updates);
    console.log();
    success('Configuration updated!');
  } else {
    console.log();
    info('No changes made');
  }
}
