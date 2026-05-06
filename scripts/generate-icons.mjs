import sharp from 'sharp';
import { writeFileSync } from 'fs';

// SVG do ícone — losango rose com letra B
const svg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#C9747A"/>
  <text
    x="50%" y="54%"
    font-family="Georgia, serif"
    font-weight="bold"
    font-size="${size * 0.52}"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
  >B</text>
</svg>`;

for (const size of [192, 512]) {
  const buf = Buffer.from(svg(size));
  const out = await sharp(buf).png().toBuffer();
  writeFileSync(`public/icon-${size}.png`, out);
  console.log(`✅ icon-${size}.png`);
}

// Apple touch icon 180x180
const buf180 = Buffer.from(svg(180));
const out180 = await sharp(buf180).png().toBuffer();
writeFileSync('public/apple-touch-icon.png', out180);
console.log('✅ apple-touch-icon.png');
