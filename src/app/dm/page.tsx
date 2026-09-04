"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  Shield, 
  Sword, 
  Dice6, 
  Map as MapIcon, 
  BookOpen, 
  Plus, 
  Trash2, 
  Play, 
  ArrowLeft,
  Copy,
  Check,
  EyeOff,
  Users,
  X,
  User,
  Dices,
  RefreshCw,
  UserMinus,
  PowerOff,
  Camera,
  RotateCcw,
  Sparkles,
  ImageIcon
} from "lucide-react";
import { CombatantDto, CharacterDto } from "@/types/game";
import { saveActiveMap, getActiveMap, removeActiveMap } from "@/lib/mapDb";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center text-xs text-slate-500">
      Harita Modulu Hazirlaniyor...
    </div>
  ),
});

export default function DMPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>("FRP-7492");
  const [copied, setCopied] = useState(false);
  
  // Harita ve Mekan/Sahne Görselleri
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null);
  const [sceneTitle, setSceneTitle] = useState<string>("Mekan / Sahne Görseli");

  const [party, setParty] = useState<CharacterDto[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<CharacterDto | null>(null);

  const [combatants, setCombatants] = useState<CombatantDto[]>([]);
  const [activeTurnIndex, setActiveTurnIndex] = useState(0);
  const activeTurnIndexRef = useRef(0);

  useEffect(() => {
    activeTurnIndexRef.current = activeTurnIndex;
  }, [activeTurnIndex]);

  const [newCombatant, setNewCombatant] = useState<{ name: string; hp: number; ac: number; init: number; avatarUrl: string | null }>({
    name: "",
    hp: 20,
    ac: 10,
    init: 10,
    avatarUrl: null
  });

  const [activeChapter, setActiveChapter] = useState(1);
  const [chapterNotes, setChapterNotes] = useState<Record<number, string>>({});
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  const [lastRoll, setLastRoll] = useState<{ text: string; isFading: boolean; isSecret: boolean; key: number } | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const removeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let targetRoom = params.get("room");

    if (!targetRoom) {
      targetRoom = localStorage.getItem("frp_current_active_dm_room") || `FRP-${Math.floor(1000 + Math.random() * 9000)}`;
      window.history.replaceState({}, "", `/dm?room=${targetRoom}`);
    }

    setRoomId(targetRoom);
    localStorage.setItem("frp_current_active_dm_room", targetRoom);

    try {
      const known = JSON.parse(localStorage.getItem("frp_all_known_rooms") || "[]");
      if (!known.includes(targetRoom)) {
        localStorage.setItem("frp_all_known_rooms", JSON.stringify([targetRoom, ...known]));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!roomId) return;

    try {
      const savedNotes = localStorage.getItem(`frp_dm_notes_${roomId}`);
      setChapterNotes(savedNotes ? JSON.parse(savedNotes) : {});

      const savedCombat = localStorage.getItem(`frp_combat_${roomId}`);
      if (savedCombat) {
        const parsed = JSON.parse(savedCombat);
        setCombatants(parsed.combatants || []);
        setActiveTurnIndex(parsed.activeTurnIndex || 0);
      } else {
        setCombatants([]);
      }

      const savedScene = localStorage.getItem(`frp_scene_${roomId}`);
      if (savedScene) {
        const parsedScene = JSON.parse(savedScene);
        setSceneImageUrl(parsedScene.imageUrl || null);
        setSceneTitle(parsedScene.title || "Mekan / Sahne Görseli");
      }
    } catch (err) {}

    getActiveMap(roomId).then((blob) => {
      setMapImageUrl(blob ? URL.createObjectURL(blob) : null);
    });
  }, [roomId]);

  const broadcastCombatState = (list: CombatantDto[], turnIdx: number) => {
    const payload = {
      type: "COMBAT_SYNC",
      roomId: roomId,
      combatants: list,
      activeTurnIndex: turnIdx,
      activeCombatantName: list.length > 0 ? list[turnIdx]?.name : null
    };

    if (channelRef.current) {
      channelRef.current.postMessage(payload);
    }
    localStorage.setItem(`frp_combat_${roomId}`, JSON.stringify(payload));
  };

  const broadcastSceneImage = (img: string | null, title: string = "Mekan / Sahne Görseli") => {
    const payload = {
      type: "SCENE_IMAGE_SYNC",
      roomId: roomId,
      imageUrl: img,
      title: title
    };

    if (channelRef.current) {
      channelRef.current.postMessage(payload);
    }
    localStorage.setItem(`frp_scene_${roomId}`, JSON.stringify({ imageUrl: img, title }));
  };

  const handleSceneUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      setSceneImageUrl(res);
      broadcastSceneImage(res, sceneTitle);
      triggerCinematicRoll("🖼️ Mekan / Sahne görseli masaya yansıtıldı!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScene = () => {
    setSceneImageUrl(null);
    broadcastSceneImage(null, sceneTitle);
    triggerCinematicRoll("🖼️ Sahne görseli masadan kaldırıldı.");
  };

  const closeTableEntirely = () => {
    if (!confirm("Masayı kapatmak istediğinize emin misiniz? Savaş alanı sıfırlanacak ve oyuncular masadan ayrılacaktır.")) return;

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "ROOM_CLOSED",
        roomId: roomId,
        timestamp: Date.now()
      });
    }

    localStorage.removeItem(`frp_combat_${roomId}`);
    localStorage.removeItem(`frp_scene_${roomId}`);
    localStorage.removeItem("frp_current_active_dm_room");
    router.push("/");
  };

  const resetCombatArea = () => {
    if (!confirm("Savaş alanını temizlemek istediğinize emin misiniz?")) return;
    setCombatants([]);
    setActiveTurnIndex(0);
    broadcastCombatState([], 0);
    triggerCinematicRoll("⚔️ Savaş alanı temizlendi.");
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (channelRef.current && roomId) {
        channelRef.current.postMessage({
          type: "ROOM_CLOSED",
          roomId: roomId,
          timestamp: Date.now()
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [roomId]);

  const createNewTable = () => {
    if (!confirm("Temiz bir masa açmak istiyor musunuz? Mevcut masa verileriniz bu oda kodunda kalacaktır.")) return;

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "ROOM_CLOSED",
        roomId: roomId,
        timestamp: Date.now()
      });
    }

    const newCode = `FRP-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomId(newCode);
    localStorage.setItem("frp_current_active_dm_room", newCode);
    window.history.pushState({}, "", `/dm?room=${newCode}`);

    try {
      const known = JSON.parse(localStorage.getItem("frp_all_known_rooms") || "[]");
      localStorage.setItem("frp_all_known_rooms", JSON.stringify([newCode, ...known]));
    } catch (e) {}

    setChapterNotes({});
    setCombatants([]);
    setActiveTurnIndex(0);
    setParty([]);
    setMapImageUrl(null);
    setSceneImageUrl(null);
    broadcastCombatState([], 0);
    broadcastSceneImage(null);
    triggerCinematicRoll(`✨ Yeni Masa Başlatıldı: [${newCode}]`);
  };

  const kickPlayer = (playerId: string, playerName: string) => {
    setParty(prev => prev.filter(p => p.id !== playerId && p.name !== playerName));
    const updatedCombat = combatants.filter(c => c.name !== playerName);
    setCombatants(updatedCombat);
    broadcastCombatState(updatedCombat, activeTurnIndex);

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "PLAYER_KICKED",
        roomId: roomId,
        playerName: playerName,
        playerId: playerId
      });
    }

    triggerCinematicRoll(`🚫 ${playerName} masadan çıkarıldı.`);
  };

  const handleNoteChange = (text: string) => {
    setSaveStatus("saving");
    const updated = { ...chapterNotes, [activeChapter]: text };
    setChapterNotes(updated);

    try {
      localStorage.setItem(`frp_dm_notes_${roomId}`, JSON.stringify(updated));
      setTimeout(() => setSaveStatus("saved"), 350);
    } catch (err) {}
  };

  const triggerCinematicRoll = (text: string, isSecret: boolean = false) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (removeTimerRef.current) clearTimeout(removeTimerRef.current);

    setLastRoll({ text, isFading: false, isSecret, key: Date.now() });

    fadeTimerRef.current = setTimeout(() => {
      setLastRoll(prev => prev ? { ...prev, isFading: true } : null);
    }, 8000);

    removeTimerRef.current = setTimeout(() => {
      setLastRoll(null);
    }, 10000);
  };

  useEffect(() => {
    if (!roomId) return;

    const channelName = `frp_table_sync_${roomId}`;
    const bc = new BroadcastChannel(channelName);
    channelRef.current = bc;

    const applyPlayerUpdate = (incomingPlayer: CharacterDto) => {
      setParty(prevParty => {
        const exists = prevParty.some(p => p.id === incomingPlayer.id || p.name === incomingPlayer.name);
        if (exists) {
          return prevParty.map(p => (p.id === incomingPlayer.id || p.name === incomingPlayer.name) ? { ...p, ...incomingPlayer } : p);
        }
        return [...prevParty, incomingPlayer];
      });

      setSelectedPlayer(current => (current?.id === incomingPlayer.id ? { ...current, ...incomingPlayer } : current));

      setCombatants(prev => prev.map(c => {
        if (c.name === incomingPlayer.name) {
          return {
            ...c,
            hp: incomingPlayer.currentHp,
            maxHp: incomingPlayer.maxHp,
            armorClass: incomingPlayer.armorClass,
            avatarUrl: incomingPlayer.avatarUrl
          };
        }
        return c;
      }));
    };

    bc.postMessage({
      type: "DM_PING",
      roomId: roomId
    });

    bc.onmessage = (event) => {
      const data = event.data;
      if (data?.type === "DICE_ROLLED") {
        triggerCinematicRoll(`${data.sender} [${data.die}] Attı ➔ ${data.result}`, false);
      }
      if (data?.type === "PLAYER_DATA_SYNC" && data.player) {
        applyPlayerUpdate(data.player);
      }
      if (data?.type === "PLAYER_LEFT") {
        setParty(prev => prev.filter(p => p.id !== data.playerId && p.name !== data.playerName));
        setCombatants(prev => {
          const filtered = prev.filter(c => c.name !== data.playerName);
          broadcastCombatState(filtered, activeTurnIndexRef.current);
          return filtered;
        });
      }
    };

    return () => {
      bc.close();
    };
  }, [roomId]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;
    setMapImageUrl(URL.createObjectURL(file));
    await saveActiveMap(file, roomId);
    publishMapToTable();
  };

  const handleRemoveMap = async () => {
    if (!confirm("Haritayı masadan kaldırmak istediğinize emin misiniz?")) return;
    await removeActiveMap(roomId);
    setMapImageUrl(null);
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "MAP_REMOVED_SYNC",
        roomId: roomId,
        timestamp: Date.now()
      });
    }
    triggerCinematicRoll("🗺️ Harita masadan kaldırıldı.");
  };

  const publishMapToTable = () => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "MAP_UPDATED_SYNC",
        roomId: roomId,
        timestamp: Date.now()
      });
    }
  };

  const rollDice = (sides: number, secret: boolean = false) => {
    const result = Math.floor(Math.random() * sides) + 1;
    const label = secret ? `GİZLİ d${sides} ➔ ${result}` : `DM d${sides} Attı ➔ ${result}`;
    triggerCinematicRoll(label, secret);

    if (!secret && channelRef.current) {
      channelRef.current.postMessage({
        type: "DICE_ROLLED",
        roomId: roomId,
        sender: "Dungeon Master",
        die: `d${sides}`,
        result: result,
        timestamp: Date.now(),
      });
    }
  };

  const addPlayerToCombat = (player: CharacterDto) => {
    if (combatants.some(c => c.name === player.name)) return;
    const item: CombatantDto = {
      id: Date.now().toString(),
      name: player.name,
      isPlayer: true,
      hp: player.currentHp,
      maxHp: player.maxHp,
      armorClass: player.armorClass,
      initiative: Math.floor(Math.random() * 20) + 1,
      avatarUrl: player.avatarUrl || null
    };
    const updated = [...combatants, item].sort((a, b) => b.initiative - a.initiative);
    setCombatants(updated);
    broadcastCombatState(updated, activeTurnIndex);
  };

  const handleDragStart = (e: React.DragEvent, player: CharacterDto) => {
    e.dataTransfer.setData("application/json", JSON.stringify(player));
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData("application/json");
      if (data) addPlayerToCombat(JSON.parse(data));
    } catch (err) {}
  };

  const addCustomCombatant = () => {
    if (!newCombatant.name.trim()) return;
    const item: CombatantDto = {
      id: Date.now().toString(),
      name: newCombatant.name,
      isPlayer: false,
      hp: newCombatant.hp,
      maxHp: newCombatant.hp,
      armorClass: newCombatant.ac,
      initiative: newCombatant.init,
      avatarUrl: newCombatant.avatarUrl
    };
    const updated = [...combatants, item].sort((a, b) => b.initiative - a.initiative);
    setCombatants(updated);
    setNewCombatant({ name: "", hp: 20, ac: 10, init: 10, avatarUrl: null });
    broadcastCombatState(updated, activeTurnIndex);
  };

  const handleMonsterAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewCombatant(prev => ({ ...prev, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const rollAndShuffleInitiatives = () => {
    if (combatants.length === 0) return;
    const rerolled = combatants.map(c => ({
      ...c,
      initiative: Math.floor(Math.random() * 20) + 1
    })).sort((a, b) => b.initiative - a.initiative);

    setCombatants(rerolled);
    setActiveTurnIndex(0);
    broadcastCombatState(rerolled, 0);
    triggerCinematicRoll("🎲 Savaş Alanı İnisiyatifleri Yeniden Sıralandı!");
  };

  const nextTurn = () => {
    if (combatants.length === 0) return;
    const nextIdx = (activeTurnIndex + 1) % combatants.length;
    setActiveTurnIndex(nextIdx);
    broadcastCombatState(combatants, nextIdx);
  };

  const removeCombatant = (id: string) => {
    const filtered = combatants.filter(c => c.id !== id);
    setCombatants(filtered);
    const newIdx = activeTurnIndex >= filtered.length ? 0 : activeTurnIndex;
    setActiveTurnIndex(newIdx);
    broadcastCombatState(filtered, newIdx);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col relative">
      {lastRoll && (
        <div 
          key={lastRoll.key}
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-2xl shadow-2xl text-xs font-bold font-mono tracking-wider z-50 flex items-center gap-2 border-2 backdrop-blur-md transition-all duration-1000 ease-in-out ${
            lastRoll.isSecret 
              ? "bg-purple-950 border-purple-500 text-purple-200" 
              : "bg-slate-900 border-amber-500 text-amber-300"
          } ${
            lastRoll.isFading ? "opacity-0 scale-95" : "opacity-100 scale-100 shadow-amber-500/10"
          }`}
        >
          <Dice6 className={`w-4 h-4 animate-spin ${lastRoll.isSecret ? "text-purple-400" : "text-amber-400"}`} />
          <span>{lastRoll.text}</span>
        </div>
      )}

      {/* Üst Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h1 className="font-bold text-base tracking-wide text-amber-200">DM KONTROL MERKEZİ</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={createNewTable}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/50 text-emerald-300 rounded-xl text-xs font-semibold transition active:scale-95 shadow-md shadow-emerald-950/40"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Yeni Masa Aç
          </button>

          <button 
            onClick={closeTableEntirely}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 border border-red-600/50 text-red-300 rounded-xl text-xs font-semibold transition active:scale-95 shadow-md shadow-red-950/40"
            title="Masayı kapatır, savaşı sıfırlar ve oyuncuları ayırır"
          >
            <PowerOff className="w-3.5 h-3.5" /> Masayı Kapat
          </button>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400">ODA:</span>
            <span className="text-sm font-mono font-bold text-amber-400">{roomId}</span>
            <button onClick={copyRoomCode} className="p-1 text-slate-400 hover:text-white transition">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SOL SÜTUN: Masadaki Oyuncular & Savaş Alanı */}
        <div className="space-y-6 flex flex-col">
          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
                <Users className="w-4 h-4" /> Masadaki Oyuncular ({party.length})
              </div>
              <span className="text-[10px] text-slate-500">Sürükle / İncele</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {party.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-600">
                  Bu odaya bağlı oyuncu yok. Kod: <strong>{roomId}</strong>
                </div>
              ) : (
                party.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p)}
                    onClick={() => setSelectedPlayer(p)}
                    className="cursor-grab active:cursor-grabbing p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 hover:bg-blue-950/20 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">🛡️ AC: {p.armorClass} | ❤️ {p.currentHp}/{p.maxHp}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addPlayerToCombat(p);
                        }}
                        className="p-1 rounded bg-blue-950/60 hover:bg-blue-900 border border-blue-800 text-[10px] text-blue-300 font-bold px-2 py-1"
                        title="Savaş Alanına Ekle"
                      >
                        + Savaşa
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          kickPlayer(p.id, p.name);
                        }}
                        className="p-1 rounded bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-[10px] text-red-300 font-bold px-1.5 py-1"
                        title="Masadan At"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SAVAŞ ALANI */}
          <section 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 flex-1 transition border-dashed hover:border-red-500/50"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm tracking-wide">
                <Sword className="w-4 h-4" /> SAVAŞ ALANI
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={resetCombatArea}
                  className="flex items-center gap-1 text-[11px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-1 rounded-lg hover:text-red-300 hover:border-red-800 transition"
                  title="Savaş alanını temizle"
                >
                  <RotateCcw className="w-3 h-3" /> Sıfırla
                </button>
                <button 
                  onClick={rollAndShuffleInitiatives}
                  className="flex items-center gap-1 text-xs bg-purple-950/50 text-purple-300 border border-purple-600/40 px-2.5 py-1 rounded-lg hover:bg-purple-900/50 transition active:scale-95"
                >
                  <Dices className="w-3.5 h-3.5 text-purple-400" /> Sırala
                </button>
                <button 
                  onClick={nextTurn}
                  className="flex items-center gap-1 text-xs bg-red-600/20 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-lg hover:bg-red-600/40 transition active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" /> Sonraki
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-[260px] pr-1">
              {combatants.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-600 border border-slate-800/60 rounded-xl">
                  Aktif çatışma yok. Oyuncuları yukarıdan ekleyin veya aşağıdan yaratık oluşturun.
                </div>
              ) : (
                combatants.map((c, idx) => (
                  <div 
                    key={c.id} 
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                      idx === activeTurnIndex 
                        ? "bg-amber-500/15 border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50" 
                        : c.isPlayer ? "bg-blue-950/20 border-blue-800/40" : "bg-slate-950/60 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 flex items-center justify-center shrink-0 bg-slate-900 shadow-md ${
                        idx === activeTurnIndex ? "border-amber-400 ring-2 ring-amber-500/30" : "border-slate-700"
                      }`}>
                        {c.avatarUrl ? (
                          <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          c.isPlayer ? <User className="w-6 h-6 text-blue-400" /> : <Sword className="w-6 h-6 text-red-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-amber-400">#{idx + 1}</span>
                          <span className="font-bold text-xs text-slate-100">{c.name}</span>
                          {!c.isPlayer && (
                            <span className="text-[9px] bg-red-950/80 text-red-300 border border-red-800/60 px-1 py-0.2 rounded font-mono uppercase">NPC</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          🎲 İnisiyatif: <strong className="text-amber-300">{c.initiative}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-blue-400 block font-bold text-[11px]">🛡️ {c.armorClass} AC</span>
                        <span className="text-emerald-400 block font-bold text-[11px]">❤️ {c.hp}/{c.maxHp}</span>
                      </div>
                      <button onClick={() => removeCombatant(c.id)} className="text-slate-600 hover:text-red-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
              <label className="relative w-9 h-9 rounded-lg border border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-950 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 transition" title="Yaratık Fotoğrafı Yükle">
                {newCombatant.avatarUrl ? (
                  <img src={newCombatant.avatarUrl} alt="Önizleme" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-4 h-4 text-amber-400/70" />
                )}
                <input type="file" accept="image/*" onChange={handleMonsterAvatarUpload} className="hidden" />
              </label>

              <input 
                placeholder="Yaratık / Boss Adı" 
                value={newCombatant.name} 
                onChange={e => setNewCombatant({...newCombatant, name: e.target.value})}
                className="flex-1 min-w-[110px] bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-amber-500"
              />
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 gap-1">
                <span>🛡️</span>
                <input 
                  type="number" 
                  value={newCombatant.ac} 
                  onChange={e => setNewCombatant({...newCombatant, ac: Number(e.target.value)})}
                  className="w-8 bg-transparent text-center font-mono font-bold text-slate-200 outline-none"
                />
              </div>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 gap-1">
                <span>❤️</span>
                <input 
                  type="number" 
                  value={newCombatant.hp} 
                  onChange={e => setNewCombatant({...newCombatant, hp: Number(e.target.value)})}
                  className="w-10 bg-transparent text-center font-mono font-bold text-slate-200 outline-none"
                />
              </div>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 gap-1">
                <span>🎲</span>
                <input 
                  type="number" 
                  value={newCombatant.init} 
                  onChange={e => setNewCombatant({...newCombatant, init: Number(e.target.value)})}
                  className="w-8 bg-transparent text-center font-mono font-bold text-slate-200 outline-none"
                />
              </div>
              <button 
                onClick={addCustomCombatant} 
                className="bg-red-600 hover:bg-red-500 text-white rounded-lg p-2 flex items-center justify-center transition active:scale-95 shadow-md shadow-red-600/30"
                title="Savaş Alanına Ekle"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>

        {/* ORTA SÜTUN: 50% / 50% YARI YARIYA (HARİTA + MEKAN / SAHNE GÖRSELİ) */}
        <div className="flex flex-col gap-5">
          
          {/* 1. ÜST YARI: HARİTA & EVREN KEŞFİ */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 flex-1 min-h-[300px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <MapIcon className="w-4 h-4" /> HARİTA & EVREN KEŞFİ
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Simültane Pan/Zoom</span>
            </div>

            <div className="flex-1 min-h-[190px] rounded-xl overflow-hidden border border-slate-800/60 bg-slate-950">
              <InteractiveMap imageUrl={mapImageUrl} isDm={true} />
            </div>

            <div className="flex gap-2 pt-1">
              <label className="flex-1 text-center cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl font-medium transition">
                {mapImageUrl ? "Haritayı Değiştir" : "Harita Yükle"}
                <input type="file" className="hidden" accept="image/*" onChange={handleMapUpload} />
              </label>

              {mapImageUrl && (
                <button 
                  onClick={handleRemoveMap}
                  className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 text-xs font-semibold transition active:scale-95"
                  title="Haritayı Masadan Kaldır"
                >
                  Kaldır
                </button>
              )}

              <button 
                onClick={publishMapToTable}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition shadow-md shadow-amber-600/20 active:scale-95"
              >
                Senkronize Et
              </button>
            </div>
          </section>

          {/* 2. ALT YARI: MEKAN, ENCOUNTER & NESNE VİTRİNİ (HANDOUT) */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 flex-1 min-h-[300px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                <ImageIcon className="w-4 h-4" /> MEKAN, ENCOUNTER & NESNE SAHNESİ
              </div>
              <span className="text-[10px] text-slate-500">Karakter Ekranına Yansır</span>
            </div>

            {/* Sahne Görseli Önizleme Alanı */}
            <div className="flex-1 min-h-[190px] rounded-xl overflow-hidden border border-slate-800/60 bg-slate-950 flex items-center justify-center relative group">
              {sceneImageUrl ? (
                <>
                  <img src={sceneImageUrl} alt="Sahne Görseli" className="w-full h-full object-contain max-h-[220px]" />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300 truncate">{sceneTitle}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">● Canlıda</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-slate-600 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto opacity-40 mb-1" />
                  <p className="text-xs font-medium">Mekan veya Sahne Görseli Yüklü Değil</p>
                  <p className="text-[10px] text-slate-500">Boss, taverna, tapınak veya gizemli bir mektup görseli yükleyin.</p>
                </div>
              )}
            </div>

            {/* Kontroller & Yükleme Barı */}
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <input
                  value={sceneTitle}
                  onChange={(e) => {
                    setSceneTitle(e.target.value);
                    if (sceneImageUrl) broadcastSceneImage(sceneImageUrl, e.target.value);
                  }}
                  placeholder="Görsel Başlığı (Örn: Kadim Zindan Kapısı)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="flex gap-2">
                <label className="flex-1 text-center cursor-pointer bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-200 text-xs py-2 rounded-xl font-medium transition shadow-sm active:scale-95">
                  {sceneImageUrl ? "Görseli Değiştir" : "Sahne / Mekan Görseli Yükle"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleSceneUpload} />
                </label>

                {sceneImageUrl && (
                  <button
                    onClick={handleRemoveScene}
                    className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 text-xs font-semibold transition active:scale-95"
                    title="Sahneyi masadan kaldır"
                  >
                    Kaldır
                  </button>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* SAĞ SÜTUN: Zarlar & Seans Notları */}
        <section className="flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5"><Dice6 className="w-4 h-4 text-purple-400" /> DM ZAR KONSOLU</span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {[4, 6, 8, 10, 12, 20].map((d) => (
                <button
                  key={d}
                  onClick={() => rollDice(d, false)}
                  className="bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/20 py-2 rounded-lg font-mono text-xs text-slate-300 transition active:scale-90"
                >
                  d{d}
                </button>
              ))}
            </div>

            <button
              onClick={() => rollDice(20, true)}
              className="w-full py-2 bg-gradient-to-r from-purple-900/40 via-purple-800/40 to-indigo-900/40 border border-purple-500/40 hover:border-purple-400 rounded-xl text-xs font-semibold text-purple-200 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <EyeOff className="w-4 h-4 text-purple-400" /> DM Gizli d20 At (Sadece Sen Görürsün)
            </button>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> SEANS NOTLARI
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition ${
                  saveStatus === "saved" ? "text-emerald-400 bg-emerald-950/40" : "text-amber-400 bg-amber-950/40"
                }`}>
                  {saveStatus === "saved" ? "✓ Kaydedildi" : "Kaydediliyor..."}
                </span>
              </div>

              <span className="text-[10px] font-mono text-slate-500">[{roomId}]</span>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[11px] text-slate-400 font-medium">Aktif Bölüm:</label>
              <select 
                value={activeChapter} 
                onChange={(e) => setActiveChapter(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-xs text-amber-300 rounded-lg px-2.5 py-1 outline-none font-mono focus:border-amber-500"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((ch) => {
                  const hasContent = Boolean(chapterNotes[ch]?.trim());
                  return (
                    <option key={ch} value={ch}>
                      {hasContent ? `🟢 Bölüm ${ch} (Dolu)` : `Bölüm ${ch}`}
                    </option>
                  );
                })}
              </select>
            </div>

            <textarea 
              placeholder={`Bölüm ${activeChapter} olay örgüsü, tuzaklar, NPC motivasyonları...`}
              value={chapterNotes[activeChapter] || ""}
              onChange={(e) => handleNoteChange(e.target.value)}
              className="w-full flex-1 min-h-[160px] bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
            />
          </div>
        </section>
      </div>

      {selectedPlayer && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 p-6 z-50 flex flex-col gap-6 shadow-2xl overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-amber-500/40 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
                {selectedPlayer.avatarUrl ? (
                  <img src={selectedPlayer.avatarUrl} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-slate-500" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-400">{selectedPlayer.name}</h2>
                <p className="text-xs text-slate-400">{selectedPlayer.className} • Seviye {selectedPlayer.level}</p>
              </div>
            </div>
            <button onClick={() => setSelectedPlayer(null)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">AC / DR</p>
              <p className="text-xl font-bold font-mono text-blue-400">{selectedPlayer.armorClass}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">CAN</p>
              <p className="text-xl font-bold font-mono text-emerald-400">{selectedPlayer.currentHp}/{selectedPlayer.maxHp}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">6 Nitelik (Canlı)</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {Object.entries(selectedPlayer.stats).map(([k, v]) => (
                <div key={k} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{k}</span>
                  <p className="text-base font-bold font-mono text-slate-100">
                    {v} <span className="text-amber-400 text-xs font-semibold">({Math.floor((v-10)/2) >= 0 ? `+${Math.floor((v-10)/2)}` : Math.floor((v-10)/2)})</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kuşanılan Teçhizat</p>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300">
              <p className="whitespace-pre-line font-mono">{selectedPlayer.equipment || "Teçhizat bilgisi girilmedi."}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Karakter Notları / Sırlar</p>
            <p className="text-xs text-slate-400 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              "{selectedPlayer.backstory || "Herhangi bir not veya sır girilmedi."}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}