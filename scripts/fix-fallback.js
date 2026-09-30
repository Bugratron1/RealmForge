const fs = require('fs');
const path = 'src/app/player/page.tsx';
let c = fs.readFileSync(path, 'utf-8');

const regex1 = /if \(\!raw\) \{\s*alert\("Bu koda ait bir karakter bulunamadı\. Lütfen kodu kontrol edin veya yeni bir karakter oluşturun\."\);\s*\} else \{\s*setIsLoaded\(true\);\s*\}/g;

c = c.replace(regex1, `if (!raw) {
          alert("Bu koda ait bir karakter bulunamadı. Lütfen kodu kontrol edin veya yeni bir karakter oluşturun.");
          setCharacterId(null);
        } else {
          setIsLoaded(true);
        }`);

const regex2 = /if \(\!raw\) \{\s*alert\("Bağlantı hatası\. Karakter yüklenemedi\."\);\s*\} else \{\s*setIsLoaded\(true\);\s*\}/g;
c = c.replace(regex2, `if (!raw) {
        alert("Bağlantı hatası. Karakter yüklenemedi.");
        setCharacterId(null);
      } else {
        setIsLoaded(true);
      }`);

fs.writeFileSync(path, c);
console.log("Error handling fallback fixed.");
