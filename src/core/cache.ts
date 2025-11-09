import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface CacheEntry {
  filename: string;
  title: string;
  fetched: string;
  outputPath: string;
  hash: string;
}

export interface CacheManifest {
  [url: string]: CacheEntry;
}

export class CacheManager {
  private manifestPath: string;
  private manifest: CacheManifest;

  constructor(configDir: string) {
    this.manifestPath = path.join(configDir, 'manifest.json');
    this.manifest = {};
    this.load();
  }

  private load(): void {
    if (!fs.existsSync(this.manifestPath)) {
      return;
    }

    try {
      const content = fs.readFileSync(this.manifestPath, 'utf-8');
      this.manifest = JSON.parse(content);
    } catch (error) {
      // If parse fails, start fresh
      this.manifest = {};
    }
  }

  private save(): void {
    fs.writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2), 'utf-8');
  }

  has(url: string): boolean {
    return url in this.manifest;
  }

  get(url: string): CacheEntry | undefined {
    return this.manifest[url];
  }

  set(url: string, entry: CacheEntry): void {
    this.manifest[url] = entry;
    this.save();
  }

  remove(url: string): void {
    delete this.manifest[url];
    this.save();
  }

  getAll(): CacheManifest {
    return { ...this.manifest };
  }

  clear(): void {
    this.manifest = {};
    this.save();
  }

  hash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
  }
}
