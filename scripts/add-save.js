const fs = require('fs');

const path = 'src/app/player/page.tsx';
let c = fs.readFileSync(path, 'utf-8');

// 1. Insert handleManualSave
const handleManualSaveCode = `
  const handleManualSave = async () => {
    if (!internalUserId) {
      alert("Karakter veritabanına bağlı değil! (ID eksik)");
      return;
    }
    setSaveStatus("unsaved");
    try {
      const totalCopper = (gold * 500) + (silver * 10) + copper;

      await Promise.all([
        fetch(\`/api/users/sync\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: characterId, name, className, level, avatarUrl })
        }),
        fetch(\`/api/users/\${internalUserId}/stats\`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stats })
        }),
        fetch(\`/api/users/\${internalUserId}/skills\`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skills })
        }),
        fetch(\`/api/users/\${internalUserId}/attributes\`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maxHp, currentHp, armorClass })
        }),
        fetch(\`/api/users/\${internalUserId}/features-traits\`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: features })
        }),
        fetch(\`/api/users/\${internalUserId}/notes\`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: notes })
        }),
        fetch(\`/api/users/\${internalUserId}/equipment\`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: equipment })
        }),
        fetch(\`/api/users/\${internalUserId}/bag\`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: bag })
        }),
        fetch(\`/api/users/\${internalUserId}/money\`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalCopper })
        })
      ]);
      setSaveStatus("saved");
      triggerCinematicToast("Karakter Başarıyla Kaydedildi!");
    } catch (err) {
      console.error(err);
      alert("Kayıt sırasında hata oluştu!");
    }
  };

`;

const insertAfter = 'const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {';
if (c.includes(insertAfter)) {
  c = c.replace(insertAfter, handleManualSaveCode + insertAfter);
}

// 2. Add "Kaydet" and "PDF Çıktı" buttons next to Otomatik Kaydedildi
const searchHeader = `<span className={\`font-mono text-[10px] px-2 py-0.5 rounded transition \${
            saveStatus === "saved" ? "text-emerald-400 bg-emerald-950/40" : "text-amber-400 bg-amber-950/40"
          }\`}>
            {saveStatus === "saved" ? "✓ Otomatik Kaydedildi" : "Kaydediliyor..."}
          </span>`;

const replaceHeader = `<span className={\`font-mono text-[10px] px-2 py-0.5 rounded transition \${
            saveStatus === "saved" ? "text-emerald-400 bg-emerald-950/40" : "text-amber-400 bg-amber-950/40"
          }\`}>
            {saveStatus === "saved" ? "✓ Otomatik Kaydedildi" : "Kaydediliyor..."}
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

if (c.includes(searchHeader)) {
  c = c.replace(searchHeader, replaceHeader);
}

fs.writeFileSync(path, c);
console.log("Updated page.tsx with manual save and PDF buttons");
