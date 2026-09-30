const fs = require('fs');
let code = fs.readFileSync('src/app/player/page.tsx', 'utf-8');

code = code.replace(
  /const \[inventory, setInventory\] = useState\(""\);\s*const \[backstory, setBackstory\] = useState\(""\);/,
  'const [bag, setBag] = useState("");\n  const [notes, setNotes] = useState("");\n  const [gold, setGold] = useState(0);\n  const [silver, setSilver] = useState(0);\n  const [copper, setCopper] = useState(0);'
);

fs.writeFileSync('src/app/player/page.tsx', code);
