"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Users, Sparkles, ArrowRight, BookOpen, KeyRound } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("frp_all_known_rooms");
      if (saved) {
        setRecentRooms(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const handleStartNewDmRoom = () => {
    const newRoomCode = `FRP-${Math.floor(1000 + Math.random() * 9000)}`;
    router.push(`/dm?room=${newRoomCode}`);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-xl w-full space-y-8 text-center relative z-10">
        
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/10 mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-amber-300 uppercase drop-shadow-[0_2px_12px_rgba(245,158,11,0.25)]">
            FRP MASA KONSOLU
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Dungeon Master ve Oyuncular için simültane harita, savaş alanı ve kalıcı seans yönetim platformu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          
          <button
            type="button"
            onClick={handleStartNewDmRoom}
            className="group p-5 rounded-2xl bg-[#0d1322]/90 border border-amber-500/20 hover:border-amber-400/60 transition shadow-xl shadow-black/40 flex flex-col justify-between text-left cursor-pointer"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition">
                Yeni DM Masası Aç
              </h2>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Rastgele bir kodla sıfır, temiz bir evren ve savaş alanı başlatır.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-amber-400">
              <span>Masayı Başlat</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>

          <Link
            href="/player"
            className="group p-5 rounded-2xl bg-[#0d1322]/90 border border-blue-500/20 hover:border-blue-400/60 transition shadow-xl shadow-black/40 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-sm text-slate-100 group-hover:text-blue-300 transition">
                Oyuncu Masasına Geç
              </h2>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Kendi benzersiz karakter kodunla kağıdını yükle veya sıfırdan oluştur.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-blue-400">
              <span>Karakter Lobisi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

        </div>

        <div className="p-5 rounded-2xl bg-[#0d1322]/80 border border-slate-800 space-y-3 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>KAYITLI BİR MASAYA DEVAM ET (DM KODU)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Önceki seanslarınızın notları ve savaşı oda koduna kaydedilir. Kaldığınız chapter'a dönmek için kodu girin:
          </p>

          <div className="flex gap-2">
            <input
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="Örn: FRP-7492"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 placeholder:text-slate-600 outline-none focus:border-amber-500 uppercase"
            />
            <Link
              href={roomCodeInput.trim() ? `/dm?room=${roomCodeInput.trim()}` : "#"}
              onClick={(e) => {
                if (!roomCodeInput.trim()) e.preventDefault();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                roomCodeInput.trim()
                  ? "bg-amber-600 hover:bg-amber-500 text-white active:scale-95 shadow-lg shadow-amber-600/20"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>DM Olarak Devam Et</span>
            </Link>
          </div>

          {mounted && recentRooms.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-slate-500">Son Masaların:</span>
              {recentRooms.slice(0, 4).map((r) => (
                <Link
                  key={r}
                  href={`/dm?room=${r}`}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-mono hover:border-amber-500 transition"
                >
                  {r}
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}