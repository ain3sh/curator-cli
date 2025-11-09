import * as https from 'https';

export interface ScrapeOptions {
  url: string;
  formats?: string[];
  onlyMainContent?: boolean;
}

export interface ScrapeMetadata {
  title?: string;
  description?: string;
  language?: string;
  statusCode?: number;
}

export interface ScrapeResult {
  success: boolean;
  markdown?: string;
  metadata?: ScrapeMetadata;
  error?: string;
}

export class FirecrawlClient {
  private apiKey: string;
  private baseUrl: string = 'api.firecrawl.dev';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    const payload = JSON.stringify({
      url: options.url,
      formats: options.formats || ['markdown'],
      onlyMainContent: options.onlyMainContent !== false
    });

    return new Promise((resolve) => {
      const req = https.request(
        {
          hostname: this.baseUrl,
          path: '/v2/scrape',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);

              if (res.statusCode === 200 && response.success) {
                resolve({
                  success: true,
                  markdown: response.data?.markdown || '',
                  metadata: response.data?.metadata || {}
                });
              } else if (res.statusCode === 429) {
                resolve({
                  success: false,
                  error: 'Rate limit exceeded. Please try again later.'
                });
              } else if (res.statusCode === 402) {
                resolve({
                  success: false,
                  error: 'Payment required. Check your Firecrawl account.'
                });
              } else if (res.statusCode === 401) {
                resolve({
                  success: false,
                  error: 'Invalid API key. Run: curate config'
                });
              } else {
                resolve({
                  success: false,
                  error: response.error || `Request failed with status ${res.statusCode}`
                });
              }
            } catch (error) {
              resolve({
                success: false,
                error: `Failed to parse response: ${data.substring(0, 100)}`
              });
            }
          });
        }
      );

      req.on('error', (error) => {
        resolve({
          success: false,
          error: `Network error: ${error.message}`
        });
      });

      req.setTimeout(60000, () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Request timeout after 60s'
        });
      });

      req.write(payload);
      req.end();
    });
  }
}
