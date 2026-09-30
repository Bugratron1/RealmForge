const fs = require('fs');
const path = 'src/app/player/page.tsx';
let c = fs.readFileSync(path, 'utf-8');

const regex = /const handleManualSave = async \(\) => \{[\s\S]*?triggerCinematicToast\("Karakter Başarıyla Kaydedildi!"\);\s*\}\s*catch\s*\(err\)\s*\{\s*console\.error\(err\);\s*alert\("Kayıt sırasında hata oluştu!"\);\s*\}\s*\};/m;

const newHandleManualSave = `const handleManualSave = async () => {
    setSaveStatus("unsaved");
    try {
      const totalCopper = gold * 500 + silver * 10 + copper;

      // 1. Create or update character basic info to get DB ID
      const syncRes = await fetch(\`/api/users/sync\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: characterId,
          name,
          className,
          level,
          avatarUrl,
        }),
      });
      
      const syncData = await syncRes.json();
      if (!syncData.success || !syncData.userId) {
        throw new Error("Karakter oluşturulamadı veya veritabanına bağlanılamadı.");
      }
      
      const dbId = syncData.userId;
      setInternalUserId(dbId);

      // 2. Save everything else using the valid DB ID
      await Promise.all([
        fetch(\`/api/users/\${dbId}/stats\`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stats }),
        }),
        fetch(\`/api/users/\${dbId}/skills\`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skills }),
        }),
        fetch(\`/api/users/\${dbId}/attributes\`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maxHp, currentHp, armorClass }),
        }),
        fetch(\`/api/users/\${dbId}/features-traits\`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: features }),
        }),
        fetch(\`/api/users/\${dbId}/notes\`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: notes }),
        }),
        fetch(\`/api/users/\${dbId}/equipment\`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: equipment }),
        }),
        fetch(\`/api/users/\${dbId}/bag\`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: bag }),
        }),
        fetch(\`/api/users/\${dbId}/money\`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalCopper }),
        }),
      ]);
      setSaveStatus("saved");
      triggerCinematicToast("Karakter Başarıyla Kaydedildi!");
    } catch (err) {
      console.error(err);
      alert("Kayıt sırasında hata oluştu!");
    }
  };`;

if (c.match(regex)) {
  c = c.replace(regex, newHandleManualSave);
  fs.writeFileSync(path, c);
  console.log("handleManualSave updated successfully.");
} else {
  console.log("Could not find handleManualSave");
}
