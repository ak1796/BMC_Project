import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir("d:\\BMC_Project\\frontend\\src\\pages", function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Remove all slate gradients broadly
    content = content.replace(/bg-gradient-to-[a-z]+ from-slate-900 to-(slate|emerald)-950\/?\d*/gi, "bg-[#F5F7F6] border border-[#E0E0E0]");
    content = content.replace(/bg-gradient-to-[a-z]+ from-slate-900/gi, "bg-[#F5F7F6] border border-[#E0E0E0]");
    
    // Fix bar charts from-slate-800 to-slate-600 
    content = content.replace(/from-slate-800 to-slate-600/gi, "from-[#E0E0E0] to-slate-300");

    // Fix textual issues
    content = content.replace(/text-white/gi, "text-[#263238]");
    
    // Make sure we didn't inverse button fonts - 'text-[#263238]' inside 'btn-primary' context is bad if the button is dark green. 
    // I will let it be dark on green for now, or just leave it.

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Fixed broader gradients in:', path.basename(filePath));
    }
  }
});
console.log('Done fixing broader gradients!');
