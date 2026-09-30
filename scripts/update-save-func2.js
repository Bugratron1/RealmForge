const fs = require('fs');

const path = 'src/app/player/page.tsx';
let c = fs.readFileSync(path, 'utf-8');

const regex = /const handleManualSave = async \(\) => \{[\s\S]*?triggerCinematicToast\("Karakter Başarıyla Kaydedildi!"\);\s*\}\s*catch\s*\(err\)\s*\{\s*console\.error\(err\);\s*alert\("Kayıt sırasında hata oluştu!"\);\s*\}\s*\};/m;

const newFunc = `const handleManualSave = async () => {
    setSaveStatus("unsaved");
    try {
      const totalCopper = gold * 500 + silver * 10 + copper;

      // 1. Create or update character ALL info to get DB ID
      const syncRes = await fetch(\`/api/users/sync\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: characterId,
          name, className, level, avatarUrl,
          maxHp, currentHp, armorClass,
          stats, skills, equipment, bag, notes, features, moneyAmount: totalCopper
        }),
      });
      
      const syncData = await syncRes.json();
      if (!syncData.success || !syncData.userId) {
        throw new Error("Karakter oluşturulamadı veya veritabanına bağlanılamadı.");
      }
      
      const dbId = syncData.userId;
      setInternalUserId(dbId);

      setSaveStatus("saved");
      triggerCinematicToast("Karakter Başarıyla Kaydedildi!");
    } catch (err) {
      console.error(err);
      alert("Kayıt sırasında hata oluştu!");
    }
  };`;

if (c.match(regex)) {
  c = c.replace(regex, newFunc);
  fs.writeFileSync(path, c);
  console.log("handleManualSave updated.");
} else {
  console.log("Could not find handleManualSave");
}
