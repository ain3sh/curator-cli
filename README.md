# Curator

> CLI to curate web content as clean markdown with media support

Curator fetches webpages and converts them to clean markdown with optional image downloads, organized in directories. Built for storing documentation and content locally so AI agents don't repeatedly fetch the same information.

## Features

- **Organized output** - Each page gets its own directory with content and media
- **Parallel processing** - Fetch multiple URLs simultaneously
- **Media downloads** - Optional image extraction with `--media` flag
- **Clean markdown** - Extracts main content, strips navs/headers
- **Smart caching** - Tracks fetched URLs to avoid duplicates
- **Zero config** - Interactive setup on first run
- Uses native HTTPS, no heavy dependencies

## Installation

### Quick Install (Recommended)

```bash
# Short URL (recommended)
curl -fsSL https://www.ain3sh.com/curator/install.sh | bash

# Or use GitHub directly
curl -fsSL https://raw.githubusercontent.com/ain3sh/curator-cli/main/scripts/install.sh | bash
```

### npm (Requires Node.js 18+)

```bash
npm install -g curator-cli
```

### Manual Development

```bash
git clone https://github.com/ain3sh/curator-cli.git
cd curator-cli
npm install
npm run build
npm link
```

## Quick Start

```bash
# First run - will prompt for API key
curate https://docs.example.com

# Fetch with images
curate https://react.dev/learn --media

# Fetch multiple pages at once
curate https://site1.com https://site2.com https://site3.com

# View cached content
curate list
```

## Usage

### Basic Command

```bash
curate <url>
```

Creates `./context/<page-title>/CONTENT.md` with the page content.

### Multiple URLs

```bash
curate <url1> <url2> <url3>
```

Processes all URLs in parallel. Each gets its own directory.

### Options

```bash
curate <url> -o ./docs/              # Custom output directory
curate <url> -n my-notes             # Custom directory name (single URL only)
curate <url> --media                 # Download images from the page
curate <url> --full                  # Include headers/navs/footers
curate <url> --refresh               # Re-fetch even if cached
```

### Management Commands

```bash
curate config    # Configure API key and settings
curate list      # Show all cached content
curate clean     # Clear cache
```

## Configuration

Configuration is stored in `~/.config/curator/.env`

```env
FIRECRAWL_API_KEY=fc-your-key-here
DEFAULT_OUTPUT_DIR=./context
CACHE_ENABLED=true
```

### Getting an API Key

1. Visit [firecrawl.dev](https://firecrawl.dev)
2. Sign up for an account
3. Get your API key from the dashboard
4. Run `curate config` to set it up

## Output Format

Each page gets its own directory with organized content:

```
./context/
  └── getting-started-with-react/
      ├── CONTENT.md
      ├── hero-image.png        (if --media used)
      └── diagram.svg           (if --media used)
```

Content files include frontmatter metadata:

```markdown
---
url: https://example.com/article
title: Getting Started with React
description: Learn React basics...
fetched: 2025-11-09T10:30:00Z
---

# Getting Started with React

[Clean markdown content...]
```

## Cache Management

Curator tracks fetched URLs in `~/.config/curator/manifest.json` to avoid duplicate fetches:

```json
{
  "https://example.com": {
    "filename": "example-domain",
    "title": "Example Domain",
    "fetched": "2025-11-09T10:30:00Z",
    "outputPath": "/path/to/context/example-domain",
    "hash": "abc123"
  }
}
```

## Why Curator?

When working with AI agents, they often fetch the same documentation repeatedly. Curator lets you:

1. Store docs locally once with `curate <url>`
2. Include images when needed with `--media`
3. Batch fetch multiple pages at once
4. Keep everything organized in directories
5. Never re-fetch unless you want to (`--refresh`)

## Examples

```bash
# Fetch single page
curate https://docs.firecrawl.dev/api-reference/v2-introduction

# Fetch page with images
curate https://react.dev/learn --media

# Fetch multiple pages in parallel
curate https://go.dev/doc/ https://go.dev/ref/spec https://go.dev/ref/mem

# Custom output directory
curate https://example.com -o ./research/

# Custom directory name (single URL only)
curate https://react.dev/reference/react -n react-api-reference

# Re-fetch updated content
curate https://docs.example.com --refresh

# Batch fetch with media to custom location
curate url1 url2 url3 --media -o ./docs/references/

# Check what you've cached
curate list
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
npm run dev -- <url>

# Link for global use
npm link
```

## License

MIT
