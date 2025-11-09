import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CuratorConfig {
  apiKey?: string;
  defaultOutputDir?: string;
  cacheEnabled?: boolean;
}

export class ConfigManager {
  private configDir: string;
  private configPath: string;
  private config: CuratorConfig;

  constructor() {
    this.configDir = path.join(os.homedir(), '.config', 'curator');
    this.configPath = path.join(this.configDir, '.env');
    this.config = {};
    this.ensureConfigDir();
    this.load();
  }

  private ensureConfigDir(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  private load(): void {
    if (!fs.existsSync(this.configPath)) {
      return;
    }

    try {
      const content = fs.readFileSync(this.configPath, 'utf-8');
      const lines = content.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();

        switch (key.trim()) {
          case 'FIRECRAWL_API_KEY':
            this.config.apiKey = value;
            break;
          case 'DEFAULT_OUTPUT_DIR':
            this.config.defaultOutputDir = value;
            break;
          case 'CACHE_ENABLED':
            this.config.cacheEnabled = value.toLowerCase() === 'true';
            break;
        }
      }
    } catch (error) {
      // Ignore errors, use defaults
    }
  }

  save(config: Partial<CuratorConfig>): void {
    this.config = { ...this.config, ...config };

    const lines = [
      `FIRECRAWL_API_KEY=${this.config.apiKey || ''}`,
      `DEFAULT_OUTPUT_DIR=${this.config.defaultOutputDir || './context'}`,
      `CACHE_ENABLED=${this.config.cacheEnabled !== false ? 'true' : 'false'}`
    ];

    fs.writeFileSync(this.configPath, lines.join('\n'), 'utf-8');
  }

  get(): CuratorConfig {
    return { ...this.config };
  }

  getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  getDefaultOutputDir(): string {
    return this.config.defaultOutputDir || './context';
  }

  isCacheEnabled(): boolean {
    return this.config.cacheEnabled !== false;
  }

  getConfigPath(): string {
    return this.configPath;
  }

  getConfigDir(): string {
    return this.configDir;
  }
}
