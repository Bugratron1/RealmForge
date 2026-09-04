"use client";

import { peerNetwork } from "@/lib/peerService";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Shield, 
  Dice6, 
  Map as MapIcon, 
  Camera, 
  Sword,
  Swords, 
  ChevronDown, 
  ChevronUp, 
  User, 
  KeyRound, 
  Sparkles, 
  ArrowRight, 
  LogOut, 
  AlertCircle, 
  Eye,
  LogOutIcon,
  RotateCcw,
  ImageIcon
} from "lucide-react";
import { getActiveMap } from "@/lib/mapDb";
import { CombatantDto } from "@/types/game";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-xs text-slate-500">Harita Modulu Yukleniyor...</div>
});

const DEFAULT_STATS = { str: 10, dex: 10, con: 10, int: 10, cha: 10, wis: 10 };
const DEFAULT_SKILLS = {
  melee: 0, athletics: 0, bruteForce: 0,
  ranged: 0, stealth: 0, sleightOfHand: 0, acrobatics: 0,
  physResist: 0, poisonResist: 0, healing: 0,
  investigation: 0, medicine: 0, history: 0, tactics: 0,
  persuasion: 0, intimidation: 0, deception: 0, performance: 0,
  perception: 0, survival: 0, willpower: 0, insight: 0,
};

export default function PlayerPage() {
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [charInput, setCharInput] = useState<string>("CHR-9160");
  const [roomInput, setRoomInput] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [lastJoinedRoom, setLastJoinedRoom] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "error" | "info" } | null>(null);

  const [sceneImage, setSceneImage] = useState<{ url: string | null; title: string }>({
    url: null,
    title: "Mekan / Sahne Görseli"
  });

  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [level, setLevel] = useState(1);
  const [background, setBackground] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [maxHp, setMaxHp] = useState(20);
  const [currentHp, setCurrentHp] = useState(20);
  const [armorClass, setArmorClass] = useState(0);

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);

  const [features, setFeatures] = useState("");
  const [conditions, setConditions] = useState("");
  const [equipment, setEquipment] = useState("");
  const [inventory, setInventory] = useState("");
  const [backstory, setBackstory] = useState("");

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCombatants, setActiveCombatants] = useState<CombatantDto[]>([]);
  const [activeTurnName, setActiveTurnName] = useState<string | null>(null);

  const [showMap, setShowMap] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [diceToast, setDiceToast] = useState<{ text: string; isFading: boolean; key: number } | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const removeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const calcMod = (val: number) => {
    const m = Math.floor((val - 10) / 2);
    return m >= 0 ? `+${m}` : `${m}`;
  };

  const handleStatChange = (key: keyof typeof stats, val: number) => {
    setStats(prev => ({ ...prev, [key]: Number.isNaN(val) ? 10 : val }));
  };

  const handleSkillChange = (key: keyof typeof skills, val: number) => {
    setSkills(prev => ({ ...prev, [key]: Number.isNaN(val) ? 0 : val }));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlChar = params.get("char");
    const urlRoom = params.get("room");

    if (urlChar) {
      loadCharacterById(urlChar.toUpperCase());
    }
    if (urlRoom) {
      setRoomId(urlRoom.toUpperCase());
      setRoomInput(urlRoom.toUpperCase());
    }
  }, []);

  // Oyuncu Masaya Bağlandığında PeerJS İstemcisi Başlat
  useEffect(() => {
    if (!roomId) return;

    loadLatestMap(roomId);

    peerNetwork.initClient(
      roomId,
      () => {
        console.log("DM Masasına İnternet Üzerinden Bağlanıldı!");
      },
      (err) => {
        console.error("Bağlantı hatası:", err);
      }
    );

    peerNetwork.onDataCallback = (data) => {
      if (data?.type === "COMBAT_SYNC" && data.combatants) {
        setActiveCombatants(data.combatants);
        setActiveTurnName(data.activeCombatantName);
      }
      if (data?.type === "SCENE_IMAGE_SYNC") {
        setSceneImage({ url: data.imageUrl || null, title: data.title || "Mekan / Sahne Görseli" });
      }
    };

    return () => {
      peerNetwork.destroy();
    };
  }, [roomId]);

  const loadCharacterById = (id: string) => {
    const key = `frp_char_${id}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const d = JSON.parse(raw);
        setName(d.name || "");
        setClassName(d.className || "");
        setLevel(d.level || 1);
        setBackground(d.background || "");
        setAvatarUrl(d.avatarUrl || null);
        setMaxHp(d.maxHp || 20);
        setCurrentHp(d.currentHp || 20);
        setArmorClass(d.armorClass || 0);
        setStats(d.stats || DEFAULT_STATS);
        setSkills(d.skills || DEFAULT_SKILLS);
        setFeatures(d.features || "");
        setConditions(d.conditions || "");
        setEquipment(d.equipment || "");
        setInventory(d.inventory || "");
        setBackstory(d.backstory || "");
        if (d.lastJoinedRoom) {
          setLastJoinedRoom(d.lastJoinedRoom);
        }
      } catch (e) {}
    } else {
      setName("Yeni Kahraman");
      setClassName("");
      setLevel(1);
      setBackground("");
      setAvatarUrl(null);
      setMaxHp(20);
      setCurrentHp(20);
      setArmorClass(0);
      setStats(DEFAULT_STATS);
      setSkills(DEFAULT_SKILLS);
      setFeatures("");
      setConditions("");
      setEquipment("");
      setInventory("");
      setBackstory("");
      setLastJoinedRoom(null);
    }
    setCharacterId(id);
    setIsLoaded(true);
  };

  const createNewCharacter = () => {
    const newId = `CHR-${Math.floor(1000 + Math.random() * 9000)}`;
    setName("");
    setClassName("");
    setLevel(1);
    setBackground("");
    setAvatarUrl(null);
    setMaxHp(20);
    setCurrentHp(20);
    setArmorClass(0);
    setStats(DEFAULT_STATS);
    setSkills(DEFAULT_SKILLS);
    setFeatures("");
    setConditions("");
    setEquipment("");
    setInventory("");
    setBackstory("");
    setLastJoinedRoom(null);

    setCharacterId(newId);
    if (roomInput.trim()) {
      const rm = roomInput.trim().toUpperCase();
      setRoomId(rm);
      setLastJoinedRoom(rm);
    }
    window.history.pushState({}, "", `/player?char=${newId}${roomInput.trim() ? `&room=${roomInput.trim().toUpperCase()}` : ""}`);
    setIsLoaded(true);
  };

  const handleLoadExistingCharacter = () => {
    const trimmed = charInput.trim().toUpperCase();
    if (!trimmed) return;
    if (roomInput.trim()) {
      const rm = roomInput.trim().toUpperCase();
      setRoomId(rm);
      setLastJoinedRoom(rm);
    }
    window.history.pushState({}, "", `/player?char=${trimmed}${roomInput.trim() ? `&room=${roomInput.trim().toUpperCase()}` : ""}`);
    loadCharacterById(trimmed);
  };

  useEffect(() => {
    if (!isLoaded || !characterId) return;

    setSaveStatus("saving");
    const fullData = {
      id: characterId,
      name, className, level, background, avatarUrl,
      maxHp, currentHp, armorClass,
      stats, skills,
      features, conditions, equipment, inventory, backstory,
      lastJoinedRoom
    };

    try {
      localStorage.setItem(`frp_char_${characterId}`, JSON.stringify(fullData));
      const t = setTimeout(() => setSaveStatus("saved"), 350);
      return () => clearTimeout(t);
    } catch (err) {}
  }, [
    name, className, level, background, avatarUrl,
    maxHp, currentHp, armorClass,
    stats, skills,
    features, conditions, equipment, inventory, backstory,
    lastJoinedRoom,
    isLoaded, characterId
  ]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const loadLatestMap = async (targetRoom: string) => {
    if (!targetRoom) {
      setMapImageUrl(null);
      return;
    }
    try {
      const blob = await getActiveMap(targetRoom);
      setMapImageUrl(blob ? URL.createObjectURL(blob) : null);
    } catch (err) {
      setMapImageUrl(null);
    }
  };

  const triggerCinematicToast = (message: string) => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (removeTimerRef.current) clearTimeout(removeTimerRef.current);

    setDiceToast({ text: message, isFading: false, key: Date.now() });

    fadeTimerRef.current = setTimeout(() => {
      setDiceToast(prev => prev ? { ...prev, isFading: true } : null);
    }, 8000);

    removeTimerRef.current = setTimeout(() => {
      setDiceToast(null);
    }, 10000);
  };

  const rollDice = (sides: number) => {
    const res = Math.floor(Math.random() * sides) + 1;
    triggerCinematicToast(`Sen d${sides} Attın ➔ ${res}`);

    if (channelRef.current && roomId) {
      channelRef.current.postMessage({
        type: "DICE_ROLLED",
        roomId: roomId,
        sender: name || characterId || "Oyuncu",
        die: `d${sides}`,
        result: res,
        timestamp: Date.now(),
      });
    }
  };

  const connectToRoom = (targetRoom: string) => {
    const cleanRoom = targetRoom.trim().toUpperCase();
    if (!cleanRoom) return;
    setRoomId(cleanRoom);
    setRoomInput(cleanRoom);
    setLastJoinedRoom(cleanRoom);
    setStatusMessage(null);
    window.history.replaceState({}, "", `/player?char=${characterId}&room=${cleanRoom}`);
    triggerCinematicToast(`[${cleanRoom}] Masasına Bağlanıldı!`);
  };

  const leaveCurrentRoom = () => {
    if (channelRef.current && roomId) {
      channelRef.current.postMessage({
        type: "PLAYER_LEFT",
        roomId: roomId,
        playerName: name,
        playerId: characterId
      });
    }
    setRoomId("");
    setRoomInput("");
    localStorage.removeItem("frp_player_connected_room");
    setActiveCombatants([]);
    setActiveTurnName(null);
    setShowMap(false);
    setMapImageUrl(null);
    setSceneImage({ url: null, title: "Mekan / Sahne Görseli" });
    window.history.replaceState({}, "", `/player?char=${characterId}`);
    setStatusMessage({ text: "Masadan ayrıldınız. Karakterinizi tek başınıza inceleyebilirsiniz.", type: "info" });
  };

  useEffect(() => {
    if (!roomId) {
      setActiveCombatants([]);
      setActiveTurnName(null);
      setMapImageUrl(null);
      setSceneImage({ url: null, title: "Mekan / Sahne Görseli" });
      return;
    }

    loadLatestMap(roomId);

    try {
      const savedScene = localStorage.getItem(`frp_scene_${roomId}`);
      if (savedScene) {
        const parsed = JSON.parse(savedScene);
        setSceneImage({ url: parsed.imageUrl || null, title: parsed.title || "Mekan / Sahne Görseli" });
      }
    } catch (e) {}

    const channelName = `frp_table_sync_${roomId}`;
    const bc = new BroadcastChannel(channelName);
    channelRef.current = bc;

    const sendDataToDm = () => {
      if (!characterId) return;
      bc.postMessage({
        type: "PLAYER_DATA_SYNC",
        roomId: roomId,
        player: {
          id: characterId,
          name: name || `Kahraman (${characterId})`,
          className: className || "Bilinmiyor",
          level: level,
          currentHp: currentHp,
          maxHp: maxHp,
          tempHp: 0,
          armorClass: armorClass,
          stats: stats,
          avatarUrl: avatarUrl,
          equipment: equipment,
          gold: 0,
          backstory: backstory,
          conditions: conditions ? [conditions] : []
        }
      });
    };

    sendDataToDm();

    bc.onmessage = (event) => {
      const data = event.data;

      if (data?.type === "ROOM_CLOSED" && data.roomId === roomId) {
        setRoomId("");
        setRoomInput("");
        localStorage.removeItem("frp_player_connected_room");
        setActiveCombatants([]);
        setActiveTurnName(null);
        setShowMap(false);
        setMapImageUrl(null);
        setSceneImage({ url: null, title: "Mekan / Sahne Görseli" });
        setStatusMessage({ text: "Dungeon Master masayı kapattı. Karakter sayfanız tekli modda çalışıyor.", type: "error" });
        triggerCinematicToast("🚪 Masa kapatıldı.");
        window.history.replaceState({}, "", `/player?char=${characterId}`);
        return;
      }

      if (data?.type === "DM_PING" && data.roomId === roomId) {
        sendDataToDm();
      }

      if (data?.type === "PLAYER_KICKED" && (data.playerName === name || data.playerId === characterId)) {
        setRoomId("");
        setRoomInput("");
        localStorage.removeItem("frp_player_connected_room");
        setActiveCombatants([]);
        setActiveTurnName(null);
        setShowMap(false);
        setMapImageUrl(null);
        setSceneImage({ url: null, title: "Mekan / Sahne Görseli" });
        setStatusMessage({ text: "Dungeon Master tarafından masadan çıkarıldınız.", type: "error" });
        triggerCinematicToast("🚫 Masadan çıkarıldınız.");
        window.history.replaceState({}, "", `/player?char=${characterId}`);
        return;
      }

      if (data?.type === "DICE_ROLLED" && data.sender !== (name || characterId)) {
        triggerCinematicToast(`${data.sender} [${data.die}] Attı ➔ ${data.result}`);
      }

      if (data?.type === "MAP_UPDATED_SYNC") {
        loadLatestMap(roomId);
      }

      if (data?.type === "MAP_REMOVED_SYNC") {
        setMapImageUrl(null);
        triggerCinematicToast("🗺️ DM haritayı masadan kaldırdı.");
      }

      if (data?.type === "SCENE_IMAGE_SYNC") {
        setSceneImage({ url: data.imageUrl || null, title: data.title || "Mekan / Sahne Görseli" });
        if (data.imageUrl) {
          triggerCinematicToast("🖼️ DM yeni bir sahne görseli yansıttı!");
        }
      }

      if (data?.type === "COMBAT_SYNC" && data.combatants) {
        setActiveCombatants(data.combatants);
        setActiveTurnName(data.activeCombatantName);
      }
    };

    return () => {
      bc.close();
    };
  }, [roomId, name, characterId, className, level, currentHp, maxHp, armorClass, stats, avatarUrl, equipment, backstory, conditions]);

  useEffect(() => {
    if (!channelRef.current || !roomId || !characterId) return;

    channelRef.current.postMessage({
      type: "PLAYER_DATA_SYNC",
      roomId: roomId,
      player: {
        id: characterId,
        name: name || `Kahraman (${characterId})`,
        className: className || "Bilinmiyor",
        level: level,
        currentHp: currentHp,
        maxHp: maxHp,
        tempHp: 0,
        armorClass: armorClass,
        stats: stats,
        avatarUrl: avatarUrl,
        equipment: equipment,
        gold: 0,
        backstory: backstory,
        conditions: conditions ? [conditions] : []
      }
    });
  }, [name, className, level, currentHp, maxHp, armorClass, stats, avatarUrl, equipment, backstory, conditions, roomId, characterId]);

  if (!characterId) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-md w-full bg-[#0d1322] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-black text-amber-300 uppercase tracking-wider">
              OYUNCU MASA GİRİŞİ
            </h1>
            <p className="text-xs text-slate-400">
              Kayıtlı bir karakterin kodunu girin veya sıfırdan yeni bir karakter oluşturun.
            </p>
          </div>

          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Kayıtlı Karakter Kodu:
            </label>
            <input
              value={charInput}
              onChange={(e) => setCharInput(e.target.value.toUpperCase())}
              placeholder="Örn: CHR-9160"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-amber-300 placeholder:text-slate-600 outline-none focus:border-amber-500 uppercase"
            />
          </div>

          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" /> Bağlanılacak Oyun Masası (İsteğe Bağlı):
            </label>
            <input
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
              placeholder="Örn: FRP-7492 (Boş bırakıp sadece karaktere bakabilirsiniz)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-blue-300 placeholder:text-slate-600 outline-none focus:border-blue-500 uppercase"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleLoadExistingCharacter}
              disabled={!charInput.trim()}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                charInput.trim() 
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 active:scale-95" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Karakter Sayfasına Git</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="relative py-2 text-center">
              <span className="text-[10px] text-slate-600 uppercase font-mono tracking-widest">VEYA</span>
            </div>

            <button
              onClick={createNewCharacter}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Sıfır Karakter Oluştur</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 p-4 md:p-6 space-y-4 font-sans pb-28">
      
      {/* Üst Bar */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 bg-[#0d1322] border border-slate-800 px-4 py-2.5 rounded-xl text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
            <span className="text-[10px] text-slate-500 font-mono">KODUN:</span>
            <span className="font-mono font-bold text-amber-400">{characterId}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${roomId ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`} />
            <span className="text-slate-400 font-medium">
              {roomId ? `Masa: ${roomId}` : "Masaya Bağlı Değil (Tekli Mod)"}
            </span>
          </div>

          <span className={`font-mono text-[10px] px-2 py-0.5 rounded transition ${
            saveStatus === "saved" ? "text-emerald-400 bg-emerald-950/40" : "text-amber-400 bg-amber-950/40"
          }`}>
            {saveStatus === "saved" ? "✓ Otomatik Kaydedildi" : "Kaydediliyor..."}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!roomId && lastJoinedRoom && (
            <button
              onClick={() => connectToRoom(lastJoinedRoom)}
              className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition active:scale-95 shadow-sm shadow-amber-500/10"
              title="En son oynadığınız masaya tekrar bağlanın"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Son Masaya Dön: {lastJoinedRoom}</span>
            </button>
          )}

          {roomId ? (
            <button
              onClick={leaveCurrentRoom}
              className="flex items-center gap-1 bg-red-950/50 hover:bg-red-900 border border-red-800 text-red-300 px-2.5 py-1 rounded-lg transition text-[11px] font-semibold"
            >
              <LogOutIcon className="w-3.5 h-3.5" /> Masadan Ayrıl
            </button>
          ) : (
            <>
              <input 
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                placeholder="FRP-XXXX"
                className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg font-mono font-bold text-blue-300 w-24 text-center outline-none focus:border-blue-500 uppercase"
              />
              <button 
                onClick={() => connectToRoom(roomInput)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-1 rounded-lg transition active:scale-95"
              >
                Masaya Katıl
              </button>
            </>
          )}

          <button 
            onClick={() => {
              setCharacterId(null);
              window.history.pushState({}, "", "/player");
            }}
            className="p-1 text-slate-500 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition ml-1"
            title="Karakter Lobisine Dön"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`max-w-6xl mx-auto p-3 rounded-xl flex items-center justify-between text-xs shadow-lg ${
          statusMessage.type === "error" 
            ? "bg-red-950/40 border border-red-500/50 text-red-300" 
            : "bg-blue-950/40 border border-blue-500/50 text-blue-300"
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="hover:text-white font-bold ml-4">
            Tamam
          </button>
        </div>
      )}

      {/* SAVAŞ ALANI */}
      <div className={`max-w-6xl mx-auto rounded-2xl p-4 shadow-xl transition ${
        roomId ? "border border-amber-600/60 bg-[#0d1322] shadow-black/50" : "border border-slate-800/80 bg-slate-950/40 text-slate-500"
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-500 text-xs">
            <Swords className="w-4 h-4 text-amber-400" /> CANLI SAVAŞ SAHASI & ENCOUNTER
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Aktif Sıra:</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold">
              {roomId && activeTurnName ? activeTurnName : "-"}
            </span>
          </div>
        </div>

        {roomId && activeCombatants.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 py-1">
            {activeCombatants.map((c, i) => {
              const isTurn = c.name === activeTurnName;
              return (
                <div 
                  key={c.id} 
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition duration-200 relative ${
                    isTurn 
                      ? "bg-amber-500/15 border-amber-400 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10 -translate-y-1" 
                      : c.isPlayer 
                        ? "bg-slate-900/90 border-blue-800/50" 
                        : "bg-slate-950/90 border-red-950/80"
                  }`}
                >
                  <span className="absolute top-1.5 left-1.5 font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-950/80 text-amber-400 border border-slate-800">
                    #{i + 1}
                  </span>

                  <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 mb-2 bg-slate-950 flex items-center justify-center shadow-inner ${
                    isTurn ? "border-amber-400 ring-2 ring-amber-400/50" : c.isPlayer ? "border-blue-500/50" : "border-red-600/50"
                  }`}>
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      c.isPlayer ? <User className="w-7 h-7 text-blue-400" /> : <Sword className="w-7 h-7 text-red-500" />
                    )}
                  </div>

                  <p className="font-bold text-xs text-slate-100 truncate w-full" title={c.name}>
                    {c.name}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    {c.isPlayer ? "Kahraman" : "Düşman / Boss"}
                  </p>

                  <div className="w-full mt-2 pt-1.5 border-t border-slate-800/80 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-blue-400 font-bold">🛡️ {c.armorClass}</span>
                    <span className="text-emerald-400 font-bold">❤️ {c.hp}/{c.maxHp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-xs text-center py-4">
            {roomId ? "Bu odada henüz aktif bir çatışma başlatılmadı." : "Masa dışındasınız. Karakterinizi düzenleyebilir, bir masaya katıldığınızda çatışmaları canlı görebilirsiniz."}
          </p>
        )}
      </div>

      {/* SAVAŞ ALANININ ALTINDAKİ HARİTA BUTONU */}
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => {
            setShowMap(!showMap);
            if (!showMap && roomId) loadLatestMap(roomId);
          }}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-between shadow-md active:scale-[0.99] ${
            showMap 
              ? "bg-amber-500/15 border-amber-500/50 text-amber-300" 
              : "bg-[#0d1322] hover:bg-[#131b30] border-slate-800 hover:border-amber-500/40 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-amber-400" />
            <span>DİNAMİK EVREN HARİTASI {roomId ? `(CANLI - ${roomId})` : "(MASA DIŞI)"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span>{showMap ? "Haritayı Gizle" : "Haritayı Aç"}</span>
            {showMap ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showMap && (
          <div className="mt-3 bg-[#0d1322] border border-amber-500/30 rounded-2xl p-4 shadow-2xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
              <span className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Canlı İzleyici Modu (Harita kontrolü ve odak tamamen Dungeon Master'dadır)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Salt Okunur</span>
            </div>

            {mapImageUrl ? (
              <div className="relative pointer-events-none select-none rounded-xl overflow-hidden min-h-[380px]">
                <InteractiveMap imageUrl={mapImageUrl} isDm={false} />
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                {roomId 
                  ? "Dungeon Master bu oda için henüz bir evren haritası yüklemedi." 
                  : "Haritayı canlı görüntülemek için lütfen üst bardan aktif bir oyun masasına bağlanın."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Başlık */}
      <div className="max-w-6xl mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <h1 className="text-lg font-black tracking-wider text-amber-400 uppercase">
            FRP KARAKTER KAĞIDI
          </h1>
        </div>
      </div>

      {/* Künye & Fotoğraf */}
      <div className="max-w-6xl mx-auto bg-[#0d1322] border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <label className="relative group cursor-pointer w-24 h-24 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-500/80 bg-slate-950/60 flex flex-col items-center justify-center overflow-hidden shrink-0 transition">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Karakter" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-2 text-slate-500 group-hover:text-amber-400 transition">
              <Camera className="w-6 h-6 mx-auto mb-1 opacity-70" />
              <span className="text-[10px] font-medium block leading-tight">Fotoğraf Ekle</span>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
        </label>

        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Karakter Adı</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="İsimsiz Kahraman"
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Class & Uzmanlaşma</label>
            <input 
              value={className} 
              onChange={e => setClassName(e.target.value)}
              placeholder="Örn: Cenkçi (Şövalye)"
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Level</label>
            <input 
              type="number"
              value={level} 
              onChange={e => setLevel(Number(e.target.value))}
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Background</label>
            <input 
              value={background} 
              onChange={e => setBackground(e.target.value)}
              placeholder="Örn: Paralı Asker"
              className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 1. ÜST BÖLÜM: ZEKA (INT) İLE TAM EŞİTLENEN SİMETRİK 3 SÜTUN (items-stretch) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        
        {/* SOL: GÜÇ, ÇEVİKLİK, DAYANIKLILIK, ZEKA */}
        <div className="space-y-3 flex flex-col justify-between">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            📊 NİTELİKLER & BECERİLER
          </h2>

          {/* GÜÇ */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
              <span className="font-bold text-xs text-slate-200">GÜÇ (STR)</span>
              <div className="flex items-center gap-1.5">
                <input 
                  type="number" 
                  value={stats.str} 
                  onChange={e => handleStatChange("str", parseInt(e.target.value))}
                  className="w-11 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center font-mono font-bold text-xs text-slate-100 outline-none focus:border-amber-500"
                />
                <span className="w-8 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs text-center">
                  {calcMod(stats.str)}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between items-center py-0.5"><span>• Yakın Dövüş</span><input type="number" value={skills.melee} onChange={e => handleSkillChange("melee", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Atletizm</span><input type="number" value={skills.athletics} onChange={e => handleSkillChange("athletics", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Kaba Kuvvet</span><input type="number" value={skills.bruteForce} onChange={e => handleSkillChange("bruteForce", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
            </div>
          </div>

          {/* ÇEVİKLİK */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
              <span className="font-bold text-xs text-slate-200">ÇEVİKLİK (DEX)</span>
              <div className="flex items-center gap-1.5">
                <input 
                  type="number" 
                  value={stats.dex} 
                  onChange={e => handleStatChange("dex", parseInt(e.target.value))}
                  className="w-11 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center font-mono font-bold text-xs text-slate-100 outline-none focus:border-amber-500"
                />
                <span className="w-8 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs text-center">
                  {calcMod(stats.dex)}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between items-center py-0.5"><span>• Menzilli Dövüş / İsabet</span><input type="number" value={skills.ranged} onChange={e => handleSkillChange("ranged", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Gizlilik</span><input type="number" value={skills.stealth} onChange={e => handleSkillChange("stealth", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• El Çabukluğu</span><input type="number" value={skills.sleightOfHand} onChange={e => handleSkillChange("sleightOfHand", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Akrobasi / Refleks</span><input type="number" value={skills.acrobatics} onChange={e => handleSkillChange("acrobatics", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
            </div>
          </div>

          {/* DAYANIKLILIK */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
              <span className="font-bold text-xs text-slate-200">DAYANIKLILIK (CON)</span>
              <div className="flex items-center gap-1.5">
                <input 
                  type="number" 
                  value={stats.con} 
                  onChange={e => handleStatChange("con", parseInt(e.target.value))}
                  className="w-11 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center font-mono font-bold text-xs text-slate-100 outline-none focus:border-amber-500"
                />
                <span className="w-8 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs text-center">
                  {calcMod(stats.con)}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between items-center py-0.5"><span>• Fiziksel Direnç</span><input type="number" value={skills.physResist} onChange={e => handleSkillChange("physResist", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Zehir / Hastalık</span><input type="number" value={skills.poisonResist} onChange={e => handleSkillChange("poisonResist", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• İyileşme / Metanet</span><input type="number" value={skills.healing} onChange={e => handleSkillChange("healing", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
            </div>
          </div>

          {/* ZEKA (Alt Sınır Referansı) */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
              <span className="font-bold text-xs text-slate-200">ZEKA (INT)</span>
              <div className="flex items-center gap-1.5">
                <input 
                  type="number" 
                  value={stats.int} 
                  onChange={e => handleStatChange("int", parseInt(e.target.value))}
                  className="w-11 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center font-mono font-bold text-xs text-slate-100 outline-none focus:border-amber-500"
                />
                <span className="w-8 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs text-center">
                  {calcMod(stats.int)}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between items-center py-0.5"><span>• Araştırma / Mantık</span><input type="number" value={skills.investigation} onChange={e => handleSkillChange("investigation", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Tıp & Simya</span><input type="number" value={skills.medicine} onChange={e => handleSkillChange("medicine", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Tarih & Bilgi</span><input type="number" value={skills.history} onChange={e => handleSkillChange("history", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Taktik / Strateji</span><input type="number" value={skills.tactics} onChange={e => handleSkillChange("tactics", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
            </div>
          </div>
        </div>

        {/* ORTA: Combat, BÜYÜTÜLMÜŞ Features & Traits ve Anlık Durumlar */}
        <div className="flex flex-col gap-4 h-full">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            ⚔️ COMBAT & STATUS
          </h2>

          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-4 space-y-4 shrink-0">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">MAX HP</p>
                <input 
                  type="number"
                  value={maxHp}
                  onChange={e => setMaxHp(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-mono font-extrabold text-xl text-slate-200 outline-none"
                />
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">CURRENT HP</p>
                <input 
                  type="number"
                  value={currentHp}
                  onChange={e => setCurrentHp(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-mono font-extrabold text-xl text-red-500 outline-none"
                />
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">ZIRH (DR)</p>
                <input 
                  type="number"
                  value={armorClass}
                  onChange={e => setArmorClass(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-mono font-extrabold text-xl text-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => setCurrentHp(h => Math.max(0, h - 1))} className="py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-300 font-bold rounded-lg text-xs transition active:scale-95">-1 HP</button>
              <button onClick={() => setCurrentHp(h => Math.max(0, h - 5))} className="py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-300 font-bold rounded-lg text-xs transition active:scale-95">-5 HP</button>
              <button onClick={() => setCurrentHp(h => Math.min(maxHp, h + 1))} className="py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/50 text-emerald-300 font-bold rounded-lg text-xs transition active:scale-95">+1 HP</button>
              <button onClick={() => setCurrentHp(h => Math.min(maxHp, h + 5))} className="py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/50 text-emerald-300 font-bold rounded-lg text-xs transition active:scale-95">+5 HP</button>
            </div>
          </div>

          {/* Boşluğu Kapatan Genişletilmiş Features & Traits */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-4 flex-1 flex flex-col space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              📜 FEATURES & TRAITS
            </h3>
            <textarea 
              value={features}
              onChange={e => setFeatures(e.target.value)}
              className="w-full flex-1 min-h-[220px] bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 resize-none font-mono"
            />
          </div>

          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-4 space-y-2 shrink-0">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              🩹 ANLIK DURUMLAR / YARALAR
            </h3>
            <textarea 
              rows={4}
              value={conditions}
              onChange={e => setConditions(e.target.value)}
              placeholder="Sol bacak yaralı, 2 Focus kaldı..."
              className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 resize-none font-mono"
            />
          </div>
        </div>

        {/* SAĞ: Kuşanılan Teçhizat, BÜYÜTÜLMÜŞ Çanta & Para ve BÜYÜTÜLMÜŞ Backstory */}
        <div className="flex flex-col gap-4 h-full">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            🎒 ENVANTER & SİLAHLAR
          </h2>

          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 space-y-1.5 shrink-0">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Kuşanılan Teçhizat</label>
            <textarea 
              rows={5}
              value={equipment}
              onChange={e => setEquipment(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 resize-none font-mono"
            />
          </div>

          {/* Boşluğu Dolduran Genişletilmiş Çanta & Para */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 flex-1 flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Çanta & Para</label>
            <textarea 
              value={inventory}
              onChange={e => setInventory(e.target.value)}
              className="w-full flex-1 min-h-[140px] bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 resize-none font-mono"
            />
          </div>

          {/* Zeka Hizasına Kilitlenen Genişletilmiş Backstory */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 flex-1 flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold text-amber-400 uppercase">
              📖 BACKSTORY
            </label>
            <textarea 
              value={backstory}
              onChange={e => setBackstory(e.target.value)}
              className="w-full flex-1 min-h-[160px] bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>
        </div>

      </div>

      {/* 2. ALT BÖLÜM: SOLDA KARİZMA & BİLGELİK / SAĞDA TAM HİZALI DM VİTRİNİ */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        
        {/* SOL: KARİZMA VE BİLGELİK */}
        <div className="space-y-3">
          {/* KARİZMA */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
              <span className="font-bold text-xs text-slate-200">KARİZMA (CHA)</span>
              <div className="flex items-center gap-1.5">
                <input 
                  type="number" 
                  value={stats.cha} 
                  onChange={e => handleStatChange("cha", parseInt(e.target.value))}
                  className="w-11 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center font-mono font-bold text-xs text-slate-100 outline-none focus:border-amber-500"
                />
                <span className="w-8 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs text-center">
                  {calcMod(stats.cha)}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between items-center py-0.5"><span>• İkna</span><input type="number" value={skills.persuasion} onChange={e => handleSkillChange("persuasion", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Gözdağı / Tehdit</span><input type="number" value={skills.intimidation} onChange={e => handleSkillChange("intimidation", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Aldatıcılık</span><input type="number" value={skills.deception} onChange={e => handleSkillChange("deception", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Gösteri & Karizma</span><input type="number" value={skills.performance} onChange={e => handleSkillChange("performance", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
            </div>
          </div>

          {/* BİLGELİK */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
              <span className="font-bold text-xs text-slate-200">BİLGELİK (WIS)</span>
              <div className="flex items-center gap-1.5">
                <input 
                  type="number" 
                  value={stats.wis} 
                  onChange={e => handleStatChange("wis", parseInt(e.target.value))}
                  className="w-11 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center font-mono font-bold text-xs text-slate-100 outline-none focus:border-amber-500"
                />
                <span className="w-8 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs text-center">
                  {calcMod(stats.wis)}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between items-center py-0.5"><span>• Farkındalık / Algı</span><input type="number" value={skills.perception} onChange={e => handleSkillChange("perception", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• İz Sürme / Doğa</span><input type="number" value={skills.survival} onChange={e => handleSkillChange("survival", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• İrade Direnci</span><input type="number" value={skills.willpower} onChange={e => handleSkillChange("willpower", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
              <div className="flex justify-between items-center py-0.5"><span>• Sezgi / Niyet Okuma</span><input type="number" value={skills.insight} onChange={e => handleSkillChange("insight", Number(e.target.value))} className="w-10 text-center font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300 outline-none focus:border-amber-500" /></div>
            </div>
          </div>
        </div>

        {/* SAĞ: KARİZMA VE BİLGELİĞİN YANINA GELEN BÜYÜK DM VİTRİNİ (lg:col-span-2) */}
        <div className="lg:col-span-2 bg-[#0d1322] border border-indigo-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <ImageIcon className="w-4 h-4" /> DM VİTRİNİ
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[260px] rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 p-2">
            {sceneImage.url ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                <img 
                  src={sceneImage.url} 
                  alt={sceneImage.title} 
                  className="max-h-[300px] w-full object-contain rounded-lg" 
                />
                <p className="text-center font-bold text-xs text-indigo-300 font-sans tracking-wide">
                  "{sceneImage.title}"
                </p>
              </div>
            ) : (
              <div className="text-center text-slate-600 space-y-1">
                <ImageIcon className="w-8 h-8 mx-auto opacity-30 text-indigo-400" />
                <p className="text-xs font-medium">Şu an aktif bir sahne veya nesne yansıtılmıyor.</p>
                <p className="text-[10px] text-slate-500">DM görsel paylaştığında burada görüntülenecektir.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Alt Zar Barı */}
      <div className="fixed bottom-4 right-4 z-50 bg-[#0d1322]/90 backdrop-blur border border-amber-500/60 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xl">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mr-2">
          <Dice6 className="w-4 h-4" /> ZAR AT:
        </div>
        {[4, 6, 8, 10, 12, 20, 100].map(s => (
          <button
            key={s}
            onClick={() => rollDice(s)}
            className="px-2.5 py-1 bg-slate-950 border border-amber-500/40 hover:bg-amber-500/20 hover:border-amber-400 rounded-lg text-amber-300 font-mono font-bold text-xs transition active:scale-90"
          >
            d{s}
          </button>
        ))}
      </div>

      {/* Sinematik Zar Bildirimi */}
      {diceToast && (
        <div 
          key={diceToast.key}
          className={`fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 border-2 border-amber-500 text-amber-300 px-6 py-3 rounded-2xl shadow-2xl text-xs font-bold font-mono tracking-wider z-50 flex items-center gap-2.5 backdrop-blur-md transition-all duration-1000 ease-in-out ${
            diceToast.isFading ? "opacity-0 scale-95" : "opacity-100 scale-100 shadow-amber-500/10"
          }`}
        >
          <Dice6 className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{diceToast.text}</span>
        </div>
      )}
    </div>
  );
}