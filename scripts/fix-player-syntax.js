const fs = require('fs');
let code = fs.readFileSync('src/app/player/page.tsx', 'utf-8');

// The replacement was:
// code = code.replace(/handleStatChange\(/g, 'setSaveStatus("unsaved"); handleStatChange(');
// which produced e => setSaveStatus("unsaved"); handleStatChange(...)
// I will change it to e => { setSaveStatus("unsaved"); handleStatChange(...) }

code = code.replace(/e => setSaveStatus\("unsaved"\); handleStatChange\((.*?)\)/g, 'e => { setSaveStatus("unsaved"); handleStatChange($1); }');
code = code.replace(/e => setSaveStatus\("unsaved"\); handleSkillChange\((.*?)\)/g, 'e => { setSaveStatus("unsaved"); handleSkillChange($1); }');
code = code.replace(/e => setSaveStatus\("unsaved"\); setMaxHp\((.*?)\)/g, 'e => { setSaveStatus("unsaved"); setMaxHp($1); }');
code = code.replace(/e => setSaveStatus\("unsaved"\); setArmorClass\((.*?)\)/g, 'e => { setSaveStatus("unsaved"); setArmorClass($1); }');
code = code.replace(/e => setSaveStatus\("unsaved"\); setFeatures\(e\.target\.value\)/g, 'e => { setSaveStatus("unsaved"); setFeatures(e.target.value); }');
code = code.replace(/e => setSaveStatus\("unsaved"\); setEquipment\(e\.target\.value\)/g, 'e => { setSaveStatus("unsaved"); setEquipment(e.target.value); }');
code = code.replace(/e => setSaveStatus\("unsaved"\); setBag\(e\.target\.value\)/g, 'e => { setSaveStatus("unsaved"); setBag(e.target.value); }');
code = code.replace(/e => setSaveStatus\("unsaved"\); setNotes\(e\.target\.value\)/g, 'e => { setSaveStatus("unsaved"); setNotes(e.target.value); }');
code = code.replace(/e => setSaveStatus\("unsaved"\); setGold\((.*?)\)/g, 'e => { setSaveStatus("unsaved"); setGold($1); }');
code = code.replace(/e => setSaveStatus\("unsaved"\); setSilver\((.*?)\)/g, 'e => { setSaveStatus("unsaved"); setSilver($1); }');
code = code.replace(/e => setSaveStatus\("unsaved"\); setCopper\((.*?)\)/g, 'e => { setSaveStatus("unsaved"); setCopper($1); }');


fs.writeFileSync('src/app/player/page.tsx', code);
