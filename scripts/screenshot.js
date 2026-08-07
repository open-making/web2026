#!/usr/bin/env node

import { chromium } from 'playwright';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanFilename(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase()
    .slice(0, 50);
}

async function takeScreenshots(urls, options = {}) {
  const {
    outputDir = 'screenshots',
    fullPage = true,
    width = 1366,
    height = 768,
    quality = 80,
    format = 'webp',
    metadataFile = null
  } = options;

  // Load metadata if provided
  let metadata = {};
  let issueInfo = null;
  if (metadataFile) {
    try {
      const metadataContent = await fs.readFile(metadataFile, 'utf-8');
      const metadataObj = JSON.parse(metadataContent);

      // Handle both old format (array) and new format (object with entries)
      const entries = Array.isArray(metadataObj) ? metadataObj : metadataObj.entries;
      issueInfo = metadataObj.issue || null;

      metadata = entries.reduce((acc, entry) => {
        acc[entry.url] = entry;
        return acc;
      }, {});
    } catch (error) {
      console.warn(`⚠️  Could not load metadata file: ${error.message}`);
    }
  }

  // Create output directories
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(path.join(outputDir, 'original'), { recursive: true });
  await fs.mkdir(path.join(outputDir, 'processed'), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width, height }
  });

  if (issueInfo) {
    console.log(`📋 Issue: ${issueInfo.title} by ${issueInfo.author}`);
  }
  console.log(`📸 Taking screenshots of ${urls.length} URLs...`);

  // Track results for metadata output
  const results = [];
  if (issueInfo) {
    results.push({ issueInfo });
  }

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const urlMetadata = metadata[url] || {};

    try {
      const authorInfo = urlMetadata.author ? ` by ${urlMetadata.author}` : '';
      const typeIcon = urlMetadata.authorType === 'issue_author' ? '👑' : '💬';
      const prefix = urlMetadata.author ? `${typeIcon} ` : '';
      console.log(`📷 ${i + 1}/${urls.length}: ${prefix}${url}${authorInfo}`);

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait a bit for any dynamic content
      await page.waitForTimeout(2000);

      const cleanName = await cleanFilename(url);
      const originalPath = path.join(outputDir, 'original', `${cleanName}.png`);
      const processedPath = path.join(outputDir, 'processed', `${cleanName}.${format}`);

      // Take screenshot
      await page.screenshot({
        path: originalPath,
        fullPage: fullPage
      });

      // Process with Sharp
      let pipeline = sharp(originalPath);

      if (format === 'webp') {
        pipeline = pipeline.webp({ quality, effort: 6 });
      } else if (format === 'jpeg' || format === 'jpg') {
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      } else if (format === 'png') {
        pipeline = pipeline.png({
          compressionLevel: 9,
          quality
        });
      }

      await pipeline.toFile(processedPath);

      // Get file sizes for comparison
      const originalStats = await fs.stat(originalPath);
      const processedStats = await fs.stat(processedPath);
      const reduction = Math.round((1 - processedStats.size / originalStats.size) * 100);

      const result = {
        url,
        filename: `${cleanName}.${format}`,
        originalPath,
        processedPath,
        fileSize: processedStats.size,
        reduction,
        ...urlMetadata
      };

      results.push(result);

      console.log(`   ✅ ${cleanName}.${format} (${Math.round(processedStats.size / 1024)}KB, ${reduction}% smaller)`);

    } catch (error) {
      console.error(`   ❌ Failed to screenshot ${url}: ${error.message}`);
      results.push({
        url,
        error: error.message,
        ...urlMetadata
      });
    }
  }

  await browser.close();

  // Save results metadata
  const resultPath = path.join(outputDir, 'metadata.json');
  await fs.writeFile(resultPath, JSON.stringify(results, null, 2));

  console.log(`\n🎉 Screenshots saved to ${outputDir}/processed/`);
  console.log(`📋 Metadata saved to ${resultPath}`);

  return results;
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node screenshot.js [options] <url1> <url2> ...

Options:
  --output-dir <dir>    Output directory (default: screenshots)
  --width <width>       Viewport width (default: 1366)
  --height <height>     Viewport height (default: 768)
  --no-full-page        Take viewport-sized screenshot only
  --quality <quality>   Image quality 1-100 (default: 80)
  --format <format>     Output format: webp, jpeg, png (default: webp)
  --metadata <file>     JSON file with author/comment metadata

Examples:
  node screenshot.js https://example.com https://google.com
  node screenshot.js --width 1200 --height 800 --format jpeg https://example.com
  node screenshot.js --no-full-page --output-dir mobile-shots https://example.com
    `);
    process.exit(1);
  }

  let options = {
    outputDir: 'screenshots',
    fullPage: true,
    width: 1366,
    height: 768,
    quality: 80,
    format: 'webp',
    metadataFile: null
  };

  let urls = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--output-dir' && i + 1 < args.length) {
      options.outputDir = args[++i];
    } else if (arg === '--width' && i + 1 < args.length) {
      options.width = parseInt(args[++i]);
    } else if (arg === '--height' && i + 1 < args.length) {
      options.height = parseInt(args[++i]);
    } else if (arg === '--quality' && i + 1 < args.length) {
      options.quality = parseInt(args[++i]);
    } else if (arg === '--format' && i + 1 < args.length) {
      options.format = args[++i];
    } else if (arg === '--metadata' && i + 1 < args.length) {
      options.metadataFile = args[++i];
    } else if (arg === '--no-full-page') {
      options.fullPage = false;
    } else if (arg.startsWith('http')) {
      urls.push(arg);
    }
  }

  if (urls.length === 0) {
    console.error('❌ No URLs provided');
    process.exit(1);
  }

  takeScreenshots(urls, options).catch(console.error);
}

export { takeScreenshots, cleanFilename };