# Generate PNG Favicon Files from SVG
# Requires: Node.js and sharp package

Write-Host "Generating favicon PNG files from SVG..." -ForegroundColor Cyan

# Check if sharp is installed
$sharpInstalled = npm list sharp 2>&1 | Select-String -Pattern "sharp@" -Quiet

if (-not $sharpInstalled) {
    Write-Host "Installing sharp package..." -ForegroundColor Yellow
    npm install --save-dev sharp
}

# Create the generation script
$scriptContent = @"
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
  console.log('Generating favicon files...');
  for (const { name, size } of sizes) {
    try {
      await sharp(inputSvg)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(join(outputDir, name));
      console.log(\`✓ Generated \${name}\`);
    } catch (error) {
      console.error(\`✗ Failed to generate \${name}:\`, error.message);
    }
  }
  console.log('\\nAll favicons generated successfully!');
}

generateFavicons().catch(console.error);
"@

$scriptPath = join-path $PSScriptRoot "generate-favicons.mjs"
$scriptContent | Out-File -FilePath $scriptPath -Encoding utf8

Write-Host "Running generation script..." -ForegroundColor Cyan
node $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Favicon generation complete!" -ForegroundColor Green
    Write-Host "Files are in: frontend/public/" -ForegroundColor Green
} else {
    Write-Host "`n✗ Generation failed. Try using the online tool instead:" -ForegroundColor Red
    Write-Host "https://realfavicongenerator.net/" -ForegroundColor Yellow
}

