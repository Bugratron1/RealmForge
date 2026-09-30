const fs = require('fs');

const path = 'src/app/player/page.tsx';
let c = fs.readFileSync(path, 'utf-8');

c = c.replace(/bag,\n\s*notes,\n\s*lastJoinedRoom/g, 'bag,\n      lastJoinedRoom');
c = c.replace(/bag,\n\s*notes,\n\s*lastJoinedRoom,\n\s*isLoaded,\n\s*characterId/g, 'bag,\n    lastJoinedRoom,\n    isLoaded,\n    characterId');

fs.writeFileSync(path, c);
console.log("Duplicate notes removed");
