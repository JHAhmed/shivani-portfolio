// Usage: node scripts/placeholder-image.mjs <out.jpg> <#hex> "<label>" [width] [height]
import sharp from 'sharp';

const [out, color, label, width = '1600', height = '1067'] = process.argv.slice(2);
if (!out || !color || !label) {
	console.error(
		'Usage: node scripts/placeholder-image.mjs <out.jpg> <#hex> "<label>" [width] [height]'
	);
	process.exit(1);
}

const w = Number(width);
const h = Number(height);
const text = label.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
<rect width="100%" height="100%" fill="${color}"/>
<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif"
 font-size="${Math.round(h / 16)}" fill="#1f1d1a" fill-opacity="0.6">${text}</text></svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(out);
console.log(`wrote ${out}`);
