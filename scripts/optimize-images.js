import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeImages() {
  // Get command line arguments or use defaults
  const inputDir = process.argv[2] || './src/public/images';
  const outputDir = process.argv[3] || './src/public/images-optimized';

  // Supported image formats
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];

  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Read all files from input directory
    const files = await fs.readdir(inputDir);

    // Filter for image files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return supportedFormats.includes(ext);
    });

    // Get already processed files
    let processedFiles = [];
    try {
      const outputFiles = await fs.readdir(outputDir);
      processedFiles = outputFiles.map(file => {
        // Remove .webp extension and get original name
        return file.replace(/\.webp$/, '');
      });
    } catch (error) {
      // Output directory might be empty, that's okay
    }

    // Filter out already processed images
    const unprocessedImages = imageFiles.filter(file => {
      const nameWithoutExt = path.parse(file).name;
      return !processedFiles.includes(nameWithoutExt);
    });

    if (unprocessedImages.length === 0) {
      console.log('✅ All images are already optimized!');
      return;
    }

    console.log(`🔄 Processing ${unprocessedImages.length} new images...`);

    // Process each unprocessed image
    for (const file of unprocessedImages) {
      const inputPath = path.join(inputDir, file);
      const nameWithoutExt = path.parse(file).name;
      const outputPath = path.join(outputDir, `${nameWithoutExt}.webp`);

      try {
        await sharp(inputPath)
          .webp({
            quality: 80,           // Adjust quality (0-100)
            effort: 4,             // Compression effort (0-6)
            lossless: false        // Set to true for lossless compression
          })
          .toFile(outputPath);

        // Get file sizes for comparison
        const inputStats = await fs.stat(inputPath);
        const outputStats = await fs.stat(outputPath);
        const savings = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);

        console.log(`✅ ${file} → ${nameWithoutExt}.webp (${savings}% smaller)`);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }

    console.log('🎉 Image optimization complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the optimization
optimizeImages();