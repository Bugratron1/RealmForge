const fs = require('fs');

const path = 'src/app/player/page.tsx';
let c = fs.readFileSync(path, 'utf-8');

const regex = /const handleLoadExistingCharacter = \(\) => \{[\s\S]*?loadCharacterById\(trimmed\);\s*\};/m;

const newBlock = `const handleLoadExistingCharacter = () => {
    const trimmed = charInput.trim().toUpperCase();
    if (!trimmed) return;
    if (roomInput.trim()) {
      const rm = roomInput.trim().toUpperCase();
      setRoomId(rm);
      setLastJoinedRoom(rm);
    }
    
    // Yönlendirme için URL'i değiştir
    window.history.pushState(
      {},
      "",
      \`/player?char=\$\{trimmed\}\$\{roomInput.trim() ? \`&room=\$\{roomInput.trim().toUpperCase()\}\` : ""\}\`,
    );
    
    // Karakter ID'sini state'e kaydet (bu render'ı tetikler ve karakter sayfasına geçirir)
    setCharacterId(trimmed);
    
    // Ve verileri yükle
    loadCharacterById(trimmed);
  };`;

if (c.match(regex)) {
  c = c.replace(regex, newBlock);
  fs.writeFileSync(path, c);
  console.log("handleLoadExistingCharacter fixed.");
} else {
  console.log("Could not find handleLoadExistingCharacter");
}
