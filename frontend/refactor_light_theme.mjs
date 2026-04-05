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
    
    let newContent = content;
    
    // Backgrounds
    newContent = newContent.replace(/bg-\[\#030712\]/g, 'bg-[#F5F7F6]');
    newContent = newContent.replace(/bg-\[\#0f172a\]/g, 'bg-white');
    newContent = newContent.replace(/bg-slate-900/g, 'bg-white');
    newContent = newContent.replace(/bg-slate-950/g, 'bg-[#F5F7F6]');
    newContent = newContent.replace(/bg-slate-800/g, 'bg-slate-100');
    
    // Transparent Backgrounds
    newContent = newContent.replace(/bg-slate-950\/80/g, 'bg-slate-200/80');
    newContent = newContent.replace(/bg-slate-950\/90/g, 'bg-slate-200/90');
    newContent = newContent.replace(/bg-slate-900\/50/g, 'bg-white/50');
    newContent = newContent.replace(/bg-slate-800\/50/g, 'bg-slate-50');
    newContent = newContent.replace(/bg-slate-800\/30/g, 'bg-slate-50');
    
    // Text Primary
    newContent = newContent.replace(/text-white/g, 'text-[#263238]');
    newContent = newContent.replace(/text-slate-100/g, 'text-[#263238]');
    newContent = newContent.replace(/text-slate-200/g, 'text-[#263238]');
    
    // Text Secondary
    newContent = newContent.replace(/text-slate-300/g, 'text-[#607D8B]');
    newContent = newContent.replace(/text-slate-400/g, 'text-[#607D8B]');
    newContent = newContent.replace(/text-slate-500/g, 'text-[#607D8B]');
    
    // Accents (Emerald to Forest Green)
    newContent = newContent.replace(/text-emerald/g, 'text-[#2E7D32]');
    newContent = newContent.replace(/bg-emerald/g, 'bg-[#2E7D32]');
    newContent = newContent.replace(/border-emerald/g, 'border-[#2E7D32]');
    
    // Navigation / Headers (Blue to Municipal Blue)
    newContent = newContent.replace(/text-blue/g, 'text-[#0D47A1]');
    newContent = newContent.replace(/bg-blue/g, 'bg-[#0D47A1]');
    newContent = newContent.replace(/border-blue/g, 'border-[#0D47A1]');

    // Border Lines
    newContent = newContent.replace(/border-white\/5/g, 'border-[#E0E0E0]');
    newContent = newContent.replace(/border-white\/10/g, 'border-[#E0E0E0]');
    newContent = newContent.replace(/border-slate-800/g, 'border-[#E0E0E0]');
    newContent = newContent.replace(/divide-white\/5/g, 'divide-[#E0E0E0]');
    newContent = newContent.replace(/border-white\/\[0\.03\]/g, 'border-[#E0E0E0]');
    
    // Ensure inputs and special backgrounds are fixed
    newContent = newContent.replace(/bg-white\/\[0\.02\]/g, 'bg-slate-50');
    newContent = newContent.replace(/bg-white\/\[0\.03\]/g, 'bg-slate-50');
    
    // Make text black on solid buttons manually if we messed it up
    // We already fixed btn-primary in index.css

    // Fines (Rose to Rose or Amber? we can keep rose for penalties)

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log('Processed:', filePath);
    }
  }
});
console.log("Light Theme Refactor Complete!");
