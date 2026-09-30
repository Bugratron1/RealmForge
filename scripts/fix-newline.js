const fs = require('fs');
let c = fs.readFileSync('src/app/player/page.tsx', 'utf-8');
c = c.split('\\\\n').join('\\n');
fs.writeFileSync('src/app/player/page.tsx', c);
console.log('Fixed \\n properly');
