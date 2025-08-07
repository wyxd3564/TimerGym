// Simple script to generate PWA icons
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple timer icon SVG
const createTimerIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.1}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="none" stroke="white" stroke-width="${size * 0.05}"/>
  <line x1="${size/2}" y1="${size/2}" x2="${size/2}" y2="${size * 0.25}" stroke="white" stroke-width="${size * 0.03}" stroke-linecap="round"/>
  <line x1="${size/2}" y1="${size/2}" x2="${size * 0.7}" y2="${size/2}" stroke="white" stroke-width="${size * 0.03}" stroke-linecap="round"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.02}" fill="white"/>
</svg>
`;

// Convert SVG to PNG using Canvas (Node.js environment)
const generateIcon = (size) => {
  const svg = createTimerIcon(size);
  
  // For now, just save as SVG - in a real implementation you'd convert to PNG
  const filename = path.join(__dirname, '..', 'public', `pwa-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Generated ${filename}`);
};

// Generate icons
generateIcon(192);
generateIcon(512);

console.log('PWA icons generated successfully!');