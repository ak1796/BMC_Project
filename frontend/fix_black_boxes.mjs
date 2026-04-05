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

    // Hardcoded Inline Styles Dark Colors -> Light Civic
    content = content.replace(/backgroundColor:\s*['"]#(020617|0f172a|030712)['"]/gi, "backgroundColor: '#ffffff'");
    content = content.replace(/backgroundColor:\s*['"]#1e293b['"]/gi, "backgroundColor: '#f8fafc'");
    content = content.replace(/borderColor:\s*['"]rgba\(255,255,255,0\.05\)['"]/gi, "borderColor: '#E0E0E0'");
    content = content.replace(/color:\s*['"]#34d399['"]/gi, "color: '#2E7D32'");
    content = content.replace(/color:\s*['"]#ffffff['"]/gi, "color: '#263238'");
    
    // Gradients
    content = content.replace(/bg-gradient-to-br from-slate-900 to-emerald-950\/20/gi, "bg-white border border-[#E0E0E0]");
    content = content.replace(/bg-gradient-to-br from-slate-900 to-slate-950/gi, "bg-white border border-[#E0E0E0]");
    
    // Lingering Slate Colors inside cards or backgrounds
    content = content.replace(/bg-slate-950/gi, "bg-[#F5F7F6]");
    content = content.replace(/bg-slate-900/gi, "bg-white");
    content = content.replace(/bg-slate-800/gi, "bg-slate-100");
    
    // Fix text coloring on some inputs that might have gotten inverted
    content = content.replace(/text-slate-950/gi, "text-white"); // Like buttons that had dark text on light background, wait, let's skip button text blindly. Actually, "Generate Eco QR" button had `text-slate-950 rounded-2xl` - in light mode, text should be white on Primary button.
    content = content.replace(/text-slate-950/gi, "text-white"); 

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Fixed inline artifacts in:', path.basename(filePath));
    }
  }
});
console.log('Done fixing black box errors!');
