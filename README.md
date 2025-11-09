# Curator

> Blazing fast CLI to curate web content as clean markdown

Curator fetches any webpage and converts it to clean markdown, perfect for storing as local context in your projects so AI agents don't have to repeatedly fetch the same information.

## Features

- 🚀 **Blazing fast** - Uses native HTTPS, no heavy dependencies
- 🎯 **Smart file naming** - Automatically uses webpage titles
- 📝 **Clean markdown** - Extracts main content, strips navs/headers
- 💾 **Intelligent caching** - Tracks fetched URLs to avoid duplicates
- ⚙️ **Zero config** - Interactive setup on first run
- 🔒 **Secure** - API key stored in `~/.config/curator/.env`

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

# Subsequent runs
curate https://react.dev/learn
curate https://golang.org/doc/

# View cached content
curate list

# Configure settings
curate config
```

## Usage

### Basic Command

```bash
curate <url>
```

Fetches the URL and saves clean markdown to `./context/<page-title>.md`

### Options

```bash
curate <url> -o ./docs/              # Custom output directory
curate <url> -n my-notes             # Custom filename
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

Files are saved with frontmatter metadata:

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
    "filename": "example-domain.md",
    "title": "Example Domain",
    "fetched": "2025-11-09T10:30:00Z",
    "outputPath": "/path/to/context/example-domain.md",
    "hash": "abc123"
  }
}
```

## Why Curator?

When working with AI agents on projects, they often need to fetch documentation repeatedly. Curator solves this by:

1. **Pre-fetching docs** - Store them locally once
2. **Clean format** - Markdown is perfect for AI context
3. **Organization** - All docs in one place with metadata
4. **Speed** - No repeated network calls

## Examples

```bash
# Fetch API documentation
curate https://docs.firecrawl.dev/api-reference/v2-introduction

# Fetch blog posts for research
curate https://blog.example.com/post -o ./research/

# Fetch with custom name
curate https://react.dev/reference/react -n react-api-reference

# Check what you've fetched
curate list

# Re-fetch updated content
curate https://docs.example.com --refresh
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
