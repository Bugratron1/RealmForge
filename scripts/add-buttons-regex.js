const fs = require('fs');

const path = 'src/app/player/page.tsx';
let c = fs.readFileSync(path, 'utf-8');

// 1. Add "Kaydet" and "PDF Çıktı" buttons next to Otomatik Kaydedildi
// We will look for {saveStatus === "saved" ? "✓ Otomatik Kaydedildi" : "Kaydediliyor..."} </span>
const regex = /\{saveStatus\s*===\s*"saved"\s*\?\s*"✓\s*Otomatik\s*Kaydedildi"\s*:\s*"Kaydediliyor\.\.\."\}\s*<\/span>/g;

const replacement = `{saveStatus === "saved" ? "✓ Otomatik Kaydedildi" : "Kaydediliyor..."}
          </span>
          <button 
            onClick={handleManualSave}
            className="ml-2 flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs font-bold transition shadow"
          >
            <Sparkles className="w-3 h-3" />
            Kaydet
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs font-bold transition shadow"
          >
            <ImageIcon className="w-3 h-3" />
            PDF Çıktı
          </button>`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync(path, c);
  console.log("Updated page.tsx with buttons");
} else {
  console.log("Could not find regex match");
}
