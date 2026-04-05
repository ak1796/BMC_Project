import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir("d:\\BMC_Project\\frontend\\src", function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Core structure
    let newContent = content.replace(/glass-card/g, 'saas-card');
    
    // Typography standardizations
    newContent = newContent.replace(/text-\[9px\]/g, 'text-xs');
    newContent = newContent.replace(/text-\[10px\]/g, 'text-xs');
    newContent = newContent.replace(/text-\[11px\]/g, 'text-sm');
    newContent = newContent.replace(/font-black/g, 'font-semibold');
    newContent = newContent.replace(/uppercase tracking-widest/g, 'font-medium');
    newContent = newContent.replace(/uppercase tracking-\[0\.2em\]/g, 'font-medium');
    newContent = newContent.replace(/uppercase tracking-\[0\.1em\]/g, 'font-medium text-slate-400');
    
    // Aesthetic standardizations (remove glows and large blurs and decorative stuff)
    newContent = newContent.replace(/blur-\[100px\]/g, '');
    newContent = newContent.replace(/blur-\[80px\]/g, '');
    newContent = newContent.replace(/blur-3xl/g, '');
    newContent = newContent.replace(/bg-gradient-to-br from-slate-900 to-slate-950/g, 'bg-[#0f172a]');
    newContent = newContent.replace(/animate-pulse-soft/g, '');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log('Processed:', filePath);
    }
  }
});
console.log("UI Refactor Complete!");
