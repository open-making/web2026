#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fetchGitHubMetadata, parseGitHubUrl } from './fetch-metadata.js';
import { cleanFilename } from './screenshot.js';

async function downloadImage(url, outputPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(buffer));
    return buffer.byteLength;
  } catch (error) {
    throw new Error(`Failed to download ${url}: ${error.message}`);
  }
}

async function optimizeImage(inputPath, outputPath, options = {}) {
  const { quality = 80, format = 'webp' } = options;
  
  let pipeline = sharp(inputPath);
  
  // Get original image metadata
  const metadata = await pipeline.metadata();
  
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
  
  await pipeline.toFile(outputPath);
  
  return metadata;
}

async function isImageUrl(url) {
  // Check file extension
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?.*)?$/i;
  if (imageExtensions.test(url)) {
    return true;
  }
  
  // GitHub user-attachments are always images
  if (url.includes('github.com/user-attachments/assets/')) {
    return true;
  }
  
  // Try to fetch headers to check content-type
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return contentType && contentType.startsWith('image/');
  } catch {
    return false;
  }
}

async function downloadAndOptimizeImages(githubUrl, options = {}) {
  const {
    outputDir = null,
    quality = 80,
    format = 'webp',
    filterPattern = null
  } = options;
  
  console.log(`🔍 Fetching metadata from GitHub issue...`);
  
  // Fetch metadata from GitHub
  const metadata = await fetchGitHubMetadata(githubUrl, { filterPattern });
  
  // Determine output directory
  let finalOutputDir;
  if (outputDir) {
    finalOutputDir = outputDir;
  } else {
    // Generate directory name from issue/repo
    const parsed = parseGitHubUrl(githubUrl);
    const issueName = parsed.type === 'single_issue' 
      ? `${parsed.repo}-issue-${parsed.issueNumber}`
      : parsed.repo;
    finalOutputDir = path.join('src/lib/assets/images', issueName);
  }
  
  // Create directories
  await fs.mkdir(finalOutputDir, { recursive: true });
  await fs.mkdir(path.join(finalOutputDir, 'original'), { recursive: true });
  await fs.mkdir(path.join(finalOutputDir, 'optimized'), { recursive: true });
  
  console.log(`📁 Output directory: ${finalOutputDir}`);
  
  // Filter to only image URLs
  console.log(`🖼️  Filtering ${metadata.entries.length} URLs for images...`);
  const imageEntries = [];
  
  for (const entry of metadata.entries) {
    if (await isImageUrl(entry.url)) {
      imageEntries.push(entry);
    }
  }
  
  console.log(`📸 Found ${imageEntries.length} image URLs to download`);
  
  if (imageEntries.length === 0) {
    console.log(`❌ No images found in the issue`);
    return { results: [], metadata };
  }
  
  const results = [];
  
  for (let i = 0; i < imageEntries.length; i++) {
    const entry = imageEntries[i];
    const { url } = entry;
    
    try {
      const authorInfo = entry.author ? ` by ${entry.author}` : '';
      const typeIcon = entry.authorType === 'issue_author' ? '👑' : '💬';
      const prefix = entry.author ? `${typeIcon} ` : '';
      
      console.log(`⬇️  ${i + 1}/${imageEntries.length}: ${prefix}${url}${authorInfo}`);
      
      // Generate filename
      const cleanName = await cleanFilename(url);
      const fileExt = path.extname(new URL(url).pathname).toLowerCase() || '.jpg';
      
      const originalPath = path.join(finalOutputDir, 'original', `${cleanName}${fileExt}`);
      const optimizedPath = path.join(finalOutputDir, 'optimized', `${cleanName}.${format}`);
      
      // Download original image
      const downloadSize = await downloadImage(url, originalPath);
      
      // Optimize image
      const imageMetadata = await optimizeImage(originalPath, optimizedPath, { quality, format });
      
      // Get optimized file size
      const optimizedStats = await fs.stat(optimizedPath);
      const reduction = Math.round((1 - optimizedStats.size / downloadSize) * 100);
      
      const result = {
        url,
        filename: `${cleanName}.${format}`,
        originalPath,
        optimizedPath,
        originalSize: downloadSize,
        optimizedSize: optimizedStats.size,
        reduction,
        dimensions: {
          width: imageMetadata.width,
          height: imageMetadata.height
        },
        format: imageMetadata.format,
        ...entry
      };
      
      results.push(result);
      
      console.log(`   ✅ ${cleanName}.${format} (${Math.round(optimizedStats.size / 1024)}KB, ${reduction}% smaller, ${imageMetadata.width}x${imageMetadata.height})`);
      
    } catch (error) {
      console.error(`   ❌ Failed to process ${url}: ${error.message}`);
      results.push({
        url,
        error: error.message,
        ...entry
      });
    }
  }
  
  // Save comprehensive metadata
  const resultMetadata = {
    issue: metadata.issue || null,
    repository: metadata.repository || null,
    generatedAt: new Date().toISOString(),
    options: { quality, format, filterPattern },
    outputDir: finalOutputDir,
    stats: {
      totalUrls: metadata.entries.length,
      imageUrls: imageEntries.length,
      successfulDownloads: results.filter(r => !r.error).length,
      failedDownloads: results.filter(r => r.error).length
    },
    images: results
  };
  
  const metadataPath = path.join(finalOutputDir, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(resultMetadata, null, 2));
  
  console.log(`\n🎉 Downloaded and optimized ${results.filter(r => !r.error).length} images`);
  console.log(`📁 Images saved to: ${finalOutputDir}/optimized/`);
  console.log(`📋 Metadata saved to: ${metadataPath}`);
  
  return { results, metadata: resultMetadata };
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node download-images.js [options] <github-url>

Arguments:
  github-url          GitHub issue URL: https://github.com/owner/repo/issues/123

Options:
  --output-dir <dir>  Output directory (default: src/lib/assets/images/[issue-name])
  --quality <1-100>   Image quality for optimization (default: 80)
  --format <format>   Output format: webp, jpeg, png (default: webp)
  --filter <pattern>  Filter URLs by regex pattern (case-insensitive)

Examples:
  # Download all images from an issue
  node download-images.js https://github.com/open-making/web2025-dev-notes/issues/1
  
  # Custom output directory and quality
  node download-images.js --output-dir images/my-project --quality 90 https://github.com/owner/repo/issues/123
  
  # Filter for specific domains
  node download-images.js --filter "imgur|github" https://github.com/owner/repo/issues/123
    `);
    process.exit(1);
  }

  let options = {
    outputDir: null,
    quality: 80,
    format: 'webp',
    filterPattern: null
  };
  
  let githubUrl = null;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--output-dir' && i + 1 < args.length) {
      options.outputDir = args[++i];
    } else if (arg === '--quality' && i + 1 < args.length) {
      options.quality = parseInt(args[++i]);
    } else if (arg === '--format' && i + 1 < args.length) {
      options.format = args[++i];
    } else if (arg === '--filter' && i + 1 < args.length) {
      options.filterPattern = args[++i];
    } else if (arg.includes('github.com') && arg.includes('/issues')) {
      githubUrl = arg;
    }
  }
  
  if (!githubUrl) {
    console.error('❌ No GitHub issue URL provided');
    process.exit(1);
  }

  downloadAndOptimizeImages(githubUrl, options).catch(console.error);
}

export { downloadAndOptimizeImages, isImageUrl, downloadImage, optimizeImage };