const fs = require('fs');
let c = fs.readFileSync('src/app/player/page.tsx', 'utf-8');

const replacement = `{/* PARA KISMI */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-4 shrink-0 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              💰 PARA
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {/* ALTIN */}
              <div className="bg-yellow-950/20 border border-yellow-700/40 rounded-lg p-2 flex flex-col gap-2">
                <div className="text-center">
                  <span className="text-[10px] text-yellow-500 font-bold block mb-1">ALTIN 🥇</span>
                  <input type="number" value={gold} onChange={e => { setSaveStatus("unsaved"); setGold(Number(e.target.value)); }} className="w-full bg-transparent text-yellow-400 text-center text-lg font-mono outline-none font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button onClick={() => { setSaveStatus("unsaved"); setGold(Math.max(0, gold - 1)); }} className="py-1 bg-red-950/40 border border-red-900/50 text-red-300 rounded text-[10px] hover:bg-red-900/60 active:scale-95 font-bold">-1</button>
                  <button onClick={() => { setSaveStatus("unsaved"); setGold(gold + 1); }} className="py-1 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 rounded text-[10px] hover:bg-emerald-900/60 active:scale-95 font-bold">+1</button>
                  <button onClick={() => { setSaveStatus("unsaved"); setGold(Math.max(0, gold - 5)); }} className="py-1 bg-red-950/40 border border-red-900/50 text-red-300 rounded text-[10px] hover:bg-red-900/60 active:scale-95 font-bold">-5</button>
                  <button onClick={() => { setSaveStatus("unsaved"); setGold(gold + 5); }} className="py-1 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 rounded text-[10px] hover:bg-emerald-900/60 active:scale-95 font-bold">+5</button>
                </div>
              </div>

              {/* GÜMÜŞ */}
              <div className="bg-slate-800/30 border border-slate-600/40 rounded-lg p-2 flex flex-col gap-2">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">GÜMÜŞ 🥈</span>
                  <input type="number" value={silver} onChange={e => { setSaveStatus("unsaved"); setSilver(Number(e.target.value)); }} className="w-full bg-transparent text-slate-300 text-center text-lg font-mono outline-none font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button onClick={() => { setSaveStatus("unsaved"); setSilver(Math.max(0, silver - 1)); }} className="py-1 bg-red-950/40 border border-red-900/50 text-red-300 rounded text-[10px] hover:bg-red-900/60 active:scale-95 font-bold">-1</button>
                  <button onClick={() => { setSaveStatus("unsaved"); setSilver(silver + 1); }} className="py-1 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 rounded text-[10px] hover:bg-emerald-900/60 active:scale-95 font-bold">+1</button>
                  <button onClick={() => { setSaveStatus("unsaved"); setSilver(Math.max(0, silver - 5)); }} className="py-1 bg-red-950/40 border border-red-900/50 text-red-300 rounded text-[10px] hover:bg-red-900/60 active:scale-95 font-bold">-5</button>
                  <button onClick={() => { setSaveStatus("unsaved"); setSilver(silver + 5); }} className="py-1 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 rounded text-[10px] hover:bg-emerald-900/60 active:scale-95 font-bold">+5</button>
                </div>
              </div>

              {/* BAKIR */}
              <div className="bg-orange-950/20 border border-orange-700/40 rounded-lg p-2 flex flex-col gap-2">
                <div className="text-center">
                  <span className="text-[10px] text-orange-500 font-bold block mb-1">BAKIR 🥉</span>
                  <input type="number" value={copper} onChange={e => { setSaveStatus("unsaved"); setCopper(Number(e.target.value)); }} className="w-full bg-transparent text-orange-400 text-center text-lg font-mono outline-none font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button onClick={() => { setSaveStatus("unsaved"); setCopper(Math.max(0, copper - 1)); }} className="py-1 bg-red-950/40 border border-red-900/50 text-red-300 rounded text-[10px] hover:bg-red-900/60 active:scale-95 font-bold">-1</button>
                  <button onClick={() => { setSaveStatus("unsaved"); setCopper(copper + 1); }} className="py-1 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 rounded text-[10px] hover:bg-emerald-900/60 active:scale-95 font-bold">+1</button>
                  <button onClick={() => { setSaveStatus("unsaved"); setCopper(Math.max(0, copper - 5)); }} className="py-1 bg-red-950/40 border border-red-900/50 text-red-300 rounded text-[10px] hover:bg-red-900/60 active:scale-95 font-bold">-5</button>
                  <button onClick={() => { setSaveStatus("unsaved"); setCopper(copper + 5); }} className="py-1 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 rounded text-[10px] hover:bg-emerald-900/60 active:scale-95 font-bold">+5</button>
                </div>
              </div>
            </div>
          </div>

          {/* ÇANTA KISMI */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-4 flex-1 flex flex-col space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              🎒 ÇANTA
            </h3>
            <textarea 
              value={bag}
              onChange={e => { setSaveStatus("unsaved"); setBag(e.target.value); }}
              className="w-full flex-1 min-h-[140px] bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 resize-none font-mono"
            />
          </div>`;

const repIdx = c.indexOf(replacement);
if (repIdx !== -1) {
    const endOfReplacement = repIdx + replacement.length;
    
    // Find the NEXT occurrence of "2. ALT BÖLÜM: SOLDA KARİZMA & BİLGELİK" after the replacement ends.
    // Wait, the duplicated part has the ENTIRE file. 
    // We can just find the LAST occurrence of "2. ALT BÖLÜM: SOLDA KARİZMA"
    const tailIdx = c.lastIndexOf('{/* 2. ALT BÖLÜM: SOLDA KARİZMA');
    
    if (tailIdx !== -1 && tailIdx > endOfReplacement) {
        // We actually want a bit of text BEFORE that:
        /*
        </div>

      </div>

      {/* 2. ALT BÖLÜM...
        */
        const backToDivs = c.lastIndexOf('</div>', tailIdx);
        const backToDivs2 = c.lastIndexOf('</div>', backToDivs - 1);
        
        const correctTail = '\\n        </div>\\n\\n      </div>\\n\\n      ' + c.substring(tailIdx);
        
        const newCode = c.substring(0, endOfReplacement) + correctTail;
        fs.writeFileSync('src/app/player/page.tsx', newCode);
        console.log("File successfully repaired!");
    } else {
        console.log("Could not find expected tail!");
    }
} else {
    console.log("Could not find replacement block!");
}
