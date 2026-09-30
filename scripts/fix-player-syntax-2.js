const fs = require('fs');
let code = fs.readFileSync('src/app/player/page.tsx', 'utf-8');

// The syntax error is:
// e => { setSaveStatus("unsaved"); handleStatChange("str", parseInt(e.target.value); })}
// I need to change it to:
// e => { setSaveStatus("unsaved"); handleStatChange("str", parseInt(e.target.value)); }

// I will just fix them all by regex matching `{ setSaveStatus("unsaved"); <func>(...); })}` and fixing the parens/braces.
code = code.replace(/e => \{ setSaveStatus\("unsaved"\); handleStatChange\((.*?); \}\)/g, 'e => { setSaveStatus("unsaved"); handleStatChange($1); }');
code = code.replace(/e => \{ setSaveStatus\("unsaved"\); handleSkillChange\((.*?); \}\)/g, 'e => { setSaveStatus("unsaved"); handleSkillChange($1); }');

// wait, the regex above $1 would match '"str", parseInt(e.target.value)'.
// So handleStatChange($1) -> handleStatChange("str", parseInt(e.target.value)) -> This is correct!

code = code.replace(/e => \{ setSaveStatus\("unsaved"\); setMaxHp\((.*?); \}\)/g, 'e => { setSaveStatus("unsaved"); setMaxHp($1); }');
code = code.replace(/e => \{ setSaveStatus\("unsaved"\); setArmorClass\((.*?); \}\)/g, 'e => { setSaveStatus("unsaved"); setArmorClass($1); }');
code = code.replace(/e => \{ setSaveStatus\("unsaved"\); setFeatures\((.*?); \}\)/g, 'e => { setSaveStatus("unsaved"); setFeatures($1); }');
code = code.replace(/e => \{ setSaveStatus\("unsaved"\); setEquipment\((.*?); \}\)/g, 'e => { setSaveStatus("unsaved"); setEquipment($1); }');
code = code.replace(/e => \{ setSaveStatus\("unsaved"\); setBag\((.*?); \}\)/g, 'e => { setSaveStatus("unsaved"); setBag($1); }');
code = code.replace(/e => \{ setSaveStatus\("unsaved"\); setNotes\((.*?); \}\)/g, 'e => { setSaveStatus("unsaved"); setNotes($1); }');
code = code.replace(/e => \{ setSaveStatus\("unsaved"\); setGold\((.*?); \}\)/g, 'e => { setSaveStatus("unsaved"); setGold($1); }');
code = code.replace(/e => \{ setSaveStatus\("unsaved"\); setSilver\((.*?); \}\)/g, 'e => { setSaveStatus("unsaved"); setSilver($1); }');
code = code.replace(/e => \{ setSaveStatus\("unsaved"\); setCopper\((.*?); \}\)/g, 'e => { setSaveStatus("unsaved"); setCopper($1); }');

fs.writeFileSync('src/app/player/page.tsx', code);
