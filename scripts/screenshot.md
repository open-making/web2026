# Screenshot Tools

Automated screenshot capture with author metadata from GitHub issues.

## Quick Start

```bash
# Fetch metadata and take screenshots in one command
pnpm run screenshot:hey-jude

# Or step by step:
pnpm run fetch-metadata https://github.com/owner/repo/issues/123
pnpm run screenshot --metadata repo-metadata.json $(cat repo.txt)
```

## Commands

### Fetch Metadata
```bash
pnpm run fetch-metadata <github-issue-url> [output-name] [options]
```

**Options:**
- `--filter <pattern>` - Filter URLs (e.g., `--filter netlify`)
- `--no-issue-body` - Skip issue body, only comments

**Example:**
```bash
pnpm run fetch-metadata https://github.com/open-making/web2025-hey-jude/issues/1 hey-jude --filter netlify
```

### Take Screenshots
```bash
pnpm run screenshot [options] <url1> <url2> ...
```

**Options:**
- `--output-dir <dir>` - Output directory
- `--metadata <file>` - JSON metadata file with authors
- `--width <px>` - Viewport width (default: 1920)
- `--height <px>` - Viewport height (default: 1080)
- `--format <format>` - webp, jpeg, png (default: webp)
- `--quality <1-100>` - Image quality (default: 80)
- `--no-full-page` - Viewport only

**Example:**
```bash
pnpm run screenshot --metadata hey-jude-metadata.json --output-dir src/lib/assets/images/hey-jude $(cat hey-jude.txt)
```

## Output Structure

```
output-dir/
├── original/          # Full-size PNG screenshots
├── processed/         # Optimized images
└── metadata.json      # Complete results with authors
```