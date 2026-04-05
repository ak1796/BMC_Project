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
    
    // Fix broken tailwind arbitrary hex classes
    newContent = newContent.replace(/\[#2E7D32\]-500\/10/g, '[#2E7D32]/10');
    newContent = newContent.replace(/\[#2E7D32\]-500\/20/g, '[#2E7D32]/20');
    newContent = newContent.replace(/\[#2E7D32\]-500\/30/g, '[#2E7D32]/30');
    newContent = newContent.replace(/\[#2E7D32\]-500/g, '[#2E7D32]');
    newContent = newContent.replace(/\[#2E7D32\]-400/g, '[#2E7D32]');
    newContent = newContent.replace(/\[#2E7D32\]-600\/10/g, '[#2E7D32]/10');
    newContent = newContent.replace(/\[#2E7D32\]-600/g, '[#2E7D32]/90');
    
    newContent = newContent.replace(/\[#0D47A1\]-500\/10/g, '[#0D47A1]/10');
    newContent = newContent.replace(/\[#0D47A1\]-500\/20/g, '[#0D47A1]/20');
    newContent = newContent.replace(/\[#0D47A1\]-500\/30/g, '[#0D47A1]/30');
    newContent = newContent.replace(/\[#0D47A1\]-500/g, '[#0D47A1]');
    newContent = newContent.replace(/\[#0D47A1\]-600/g, '[#0D47A1]');
    
    // Fix any other weird color artifacts
    newContent = newContent.replace(/\[#2E7D32\]-950/g, 'white');
    newContent = newContent.replace(/\[#2E7D32\]-100/g, '[#263238]');

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log('Fixed:', filePath);
    }
  }
});
console.log("Cleanup Complete!");
