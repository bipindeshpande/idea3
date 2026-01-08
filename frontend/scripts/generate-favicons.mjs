import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-64x64.png', size: 64 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'web-app-manifest-192x192.png', size: 192 },
  { name: 'web-app-manifest-512x512.png', size: 512 },
];

const inputSvg = join(__dirname, '../public/favicon.svg');
const outputDir = join(__dirname, '../public');

if (!existsSync(inputSvg)) {
  console.error('Error: favicon.svg not found at', inputSvg);
  process.exit(1);
}

async function generateFavicons() {
  console.log('Generating favicon files from SVG...\n');
  for (const { name, size } of sizes) {
    try {
      await sharp(inputSvg)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(join(outputDir, name));
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }
  console.log('\n✓ All favicons generated successfully!');
  console.log('Files are in: frontend/public/');
}

generateFavicons().catch(console.error);

