const fs = require('fs');
let code = fs.readFileSync('src/app/player/page.tsx', 'utf-8');

code = code.replace(/setConditions\(/g, 'setNotes(');
code = code.replace(/setInventory\(/g, 'setBag(');
code = code.replace(/setBackstory\(/g, 'setNotes(');

fs.writeFileSync('src/app/player/page.tsx', code);
