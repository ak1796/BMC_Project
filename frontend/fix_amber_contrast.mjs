import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const DEEP_AMBER = '[#E65100]';

walkDir("d:\\BMC_Project\\frontend\\src\\pages", function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Convert all light amber and orange tailwind classes to our custom high-contrast Deep Amber
    content = content.replace(/text-amber-500/g, `text-${DEEP_AMBER}`);
    content = content.replace(/bg-amber-500/g, `bg-${DEEP_AMBER}`);
    content = content.replace(/border-amber-500/g, `border-${DEEP_AMBER}`);
    content = content.replace(/text-amber-200/g, `text-${DEEP_AMBER}`);
    content = content.replace(/text-amber-400/g, `text-${DEEP_AMBER}`);
    
    // Also catch orange
    content = content.replace(/text-orange-500/g, `text-${DEEP_AMBER}`);
    content = content.replace(/bg-orange-500/g, `bg-${DEEP_AMBER}`);
    content = content.replace(/border-orange-500/g, `border-${DEEP_AMBER}`);

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Enhanced amber contrast in:', path.basename(filePath));
    }
  }
});
console.log('Done fixing amber/orange contrast!');
