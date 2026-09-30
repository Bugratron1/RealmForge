const fs = require('fs');

const path = 'src/app/player/page.tsx';
let c = fs.readFileSync(path, 'utf-8');

const regex = /const loadCharacterById = \(id: string\) => \{[\s\S]*?setIsLoaded\(true\);\s*\};/m;

const newFunc = `const loadCharacterById = async (id: string) => {
    // 1. Önce LocalStorage'a bakalım hızlı yükleme için
    const key = \`frp_char_\${id}\`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const d = JSON.parse(raw);
        setName(d.name || "");
        setClassName(d.className || "");
        setLevel(d.level || 1);
        setBackground(d.background || "");
        setAvatarUrl(d.avatarUrl || null);
        setMaxHp(d.maxHp || 20);
        setCurrentHp(d.currentHp || 20);
        setArmorClass(d.armorClass || 0);
        if (d.stats) setStats(d.stats);
        if (d.skills) setSkills(d.skills);
        setFeatures(d.features || "");
        setNotes(d.notes || "");
        setEquipment(d.equipment || "");
        setBag(d.bag || "");
        
        // Convert total copper back to gold, silver, copper for UI if stored as moneyAmount
        if (typeof d.moneyAmount === 'number') {
           setGold(Math.floor(d.moneyAmount / 500));
           setSilver(Math.floor((d.moneyAmount % 500) / 10));
           setCopper(d.moneyAmount % 10);
        }
      } catch (err) {
        console.error("Local parse error", err);
      }
    }

    // 2. Ardından DB'den en güncel veriyi çekelim
    try {
      const res = await fetch(\`/api/users/load?uid=\${id}\`);
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
          
          // Güncel veriyi lokale de yaz
          localStorage.setItem(key, JSON.stringify({
            name: d.name, className: d.className, level: d.level, avatarUrl: d.avatarUrl,
            maxHp: d.maxHp, currentHp: d.currentHp, armorClass: d.armorClass,
            stats: d.stats, skills: d.skills, equipment: d.equipment, bag: d.bag, notes: d.notes, features: d.features, moneyAmount: d.moneyAmount
          }));
          
          setSaveStatus("saved");
        }
      }
    } catch (err) {
      console.error("Error fetching character from DB", err);
    }
    
    setIsLoaded(true);
  };`;

if (c.match(regex)) {
  c = c.replace(regex, newFunc);
  fs.writeFileSync(path, c);
  console.log("loadCharacterById updated.");
} else {
  console.log("Could not find loadCharacterById");
}
