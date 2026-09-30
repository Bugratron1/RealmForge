const fs = require('fs');

const path = 'src/app/player/page.tsx';
let c = fs.readFileSync(path, 'utf-8');

const regex = /try\s*\{\s*const res = await fetch\(\`\/api\/users\/load\?uid=\$\{id\}\`\);\s*if \(res\.ok\) \{[\s\S]*?\}\s*\} catch \(err\) \{\s*console\.error\("Error fetching character from DB", err\);\s*\}\s*setIsLoaded\(true\);/m;

const newBlock = `try {
      const res = await fetch(\`/api/users/load?uid=\$\{id\}\`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setInternalUserId(d.internalUserId);
          setName(d.name || "");
          setClassName(d.className || "");
          setLevel(d.level || 1);
          setAvatarUrl(d.avatarUrl || null);
          setMaxHp(d.maxHp || 20);
          setCurrentHp(d.currentHp || 20);
          setArmorClass(d.armorClass || 0);
          if (d.stats) setStats(d.stats);
          if (d.skills) setSkills(d.skills);
          setEquipment(d.equipment || "");
          setBag(d.bag || "");
          setNotes(d.notes || "");
          setFeatures(d.features || "");
          
          if (typeof d.moneyAmount === 'number') {
             setGold(Math.floor(d.moneyAmount / 500));
             setSilver(Math.floor((d.moneyAmount % 500) / 10));
             setCopper(d.moneyAmount % 10);
          }
          
          localStorage.setItem(key, JSON.stringify({
            name: d.name, className: d.className, level: d.level, avatarUrl: d.avatarUrl,
            maxHp: d.maxHp, currentHp: d.currentHp, armorClass: d.armorClass,
            stats: d.stats, skills: d.skills, equipment: d.equipment, bag: d.bag, notes: d.notes, features: d.features, moneyAmount: d.moneyAmount
          }));
          
          setSaveStatus("saved");
          setIsLoaded(true);
        } else {
          alert("Karakter verisi okunamadı!");
        }
      } else {
        if (!raw) {
          alert("Bu koda ait bir karakter bulunamadı. Lütfen kodu kontrol edin veya yeni bir karakter oluşturun.");
        } else {
          setIsLoaded(true);
        }
      }
    } catch (err) {
      console.error("Error fetching character from DB", err);
      if (!raw) {
        alert("Bağlantı hatası. Karakter yüklenemedi.");
      } else {
        setIsLoaded(true);
      }
    }`;

if (c.match(regex)) {
  c = c.replace(regex, newBlock);
  fs.writeFileSync(path, c);
  console.log("loadCharacterById error handling updated.");
} else {
  console.log("Regex mismatch!");
}
