import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputSvg = join(__dirname, '../public/og-image.svg');
const outputJpg = join(__dirname, '../public/og-image.jpg');

if (!existsSync(inputSvg)) {
  console.error('Error: og-image.svg not found at', inputSvg);
  process.exit(1);
}

async function generateOgImage() {
  console.log('Generating OG image from SVG...\n');
  try {
    await sharp(inputSvg)
      .resize(1200, 630, { fit: 'fill' })
      .jpeg({ quality: 90 })
      .toFile(outputJpg);
    console.log(`✓ Generated og-image.jpg (1200x630)`);
    console.log('File is in: frontend/public/');
  } catch (error) {
    console.error(`✗ Failed to generate og-image.jpg:`, error.message);
    process.exit(1);
  }
}

generateOgImage().catch(console.error);

