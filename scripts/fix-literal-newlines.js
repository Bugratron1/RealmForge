const fs = require('fs');
let c = fs.readFileSync('src/app/player/page.tsx', 'utf-8');

// We are looking for the literal string "\" + "n"
// Let's print out if it exists
if (c.indexOf('\\n') !== -1) {
    console.log("Found literal \\n characters!");
    c = c.split('\\n').join('');
    fs.writeFileSync('src/app/player/page.tsx', c);
    console.log("Removed them.");
} else {
    console.log("No literal \\n found.");
}
