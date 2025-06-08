const fs = require('fs');
const path = require('path');

// Create a simple SVG icon that can be saved as PNG
const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: #00A99D; }
      .shield { fill: #FFFFFF; }
      .text { fill: #00A99D; font-family: Arial, sans-serif; font-weight: bold; font-size: ${size * 0.15}px; }
    </style>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect class="bg" width="${size}" height="${size}" rx="${size * 0.125}" ry="${size * 0.125}"/>
  
  <!-- Shield shape -->
  <path class="shield" d="M ${size/2} ${size/2 - size*0.25} 
                         L ${size/2 + size*0.2} ${size/2 - size*0.125} 
                         L ${size/2 + size*0.2} ${size/2 + size*0.125} 
                         L ${size/2} ${size/2 + size*0.25} 
                         L ${size/2 - size*0.2} ${size/2 + size*0.125} 
                         L ${size/2 - size*0.2} ${size/2 - size*0.125} Z"/>
  
  <!-- Text -->
  <text class="text" x="${size/2}" y="${size/2 + size*0.05}" text-anchor="middle">PG</text>
</svg>`;
};

// Create icons directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Generate SVG icons
const icon192 = createSVGIcon(192);
const icon512 = createSVGIcon(512);

// Save SVG files (these can be used as fallbacks)
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), icon512);

console.log('SVG icons created successfully!');
console.log('You can convert these to PNG using an online converter or image editing software.');
console.log('Files created:');
console.log('- public/icon-192.svg');
console.log('- public/icon-512.svg');
