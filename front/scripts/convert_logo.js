import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../src/assets/Logo.png');
const outputPath = path.join(__dirname, '../public/favicon.svg');

try {
    // Read the PNG file
    const imageBuffer = fs.readFileSync(inputPath);
    const base64Image = imageBuffer.toString('base64');

    // Create SVG content
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <image width="64" height="64" xlink:href="data:image/png;base64,${base64Image}"/>
</svg>`;

    // Write the SVG file
    fs.writeFileSync(outputPath, svgContent);
    console.log(`Successfully created ${outputPath}`);
} catch (error) {
    console.error('Error converting logo:', error);
    process.exit(1);
}
