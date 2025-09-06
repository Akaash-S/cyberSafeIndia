// Icon generation script for CyberSafe India Extension
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'dist-extension', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple SVG icon template
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#667eea"/>
  <path d="M${size * 0.3} ${size * 0.25}L${size * 0.5} ${size * 0.375}L${size * 0.7} ${size * 0.25}" stroke="white" stroke-width="${size * 0.05}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${size * 0.3} ${size * 0.375}L${size * 0.5} ${size * 0.5}L${size * 0.7} ${size * 0.375}" stroke="white" stroke-width="${size * 0.05}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${size * 0.3} ${size * 0.5}L${size * 0.5} ${size * 0.625}L${size * 0.7} ${size * 0.5}" stroke="white" stroke-width="${size * 0.05}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${size * 0.5}" cy="${size * 0.75}" r="${size * 0.1}" fill="white"/>
</svg>`;

// Icon sizes needed for the extension
const iconSizes = [16, 32, 48, 128];

console.log('Creating extension icons...');

iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const iconPath = path.join(iconsDir, `icon-${size}.png`);
  
  // For now, we'll create SVG files and let the user convert them to PNG
  // In a production environment, you'd use a library like sharp or canvas to convert SVG to PNG
  const svgPath = path.join(iconsDir, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  
  console.log(`Created icon-${size}.svg`);
});

// Create a simple README for icon conversion
const readmeContent = `
# Extension Icons

This directory contains SVG icons for the CyberSafe India browser extension.

## Converting to PNG

To convert the SVG files to PNG format, you can use:

1. **Online converter**: Upload the SVG files to an online SVG to PNG converter
2. **Command line tools**: Use tools like Inkscape or ImageMagick
3. **Design software**: Open in Photoshop, GIMP, or similar software

## Required PNG files:
- icon-16.png (16x16 pixels)
- icon-32.png (32x32 pixels) 
- icon-48.png (48x48 pixels)
- icon-128.png (128x128 pixels)

## Icon Design
The icon features a shield with security scan lines, representing the protection and scanning capabilities of CyberSafe India.
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), readmeContent);

console.log('Icon generation complete!');
console.log('Note: SVG files have been created. Please convert them to PNG format for the extension to work properly.');

