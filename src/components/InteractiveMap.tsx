"use client";

import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface Props {
  imageUrl?: string | null;
  isDm?: boolean;
}

export default function InteractiveMap({ imageUrl, isDm = false }: Props) {
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  const channelRef = useRef<BroadcastChannel | null>(null);

  // Görseli HTMLImage'e dönüştür
  useEffect(() => {
    if (!imageUrl) {
      setImageObj(null);
      return;
    }
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImageObj(img);
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [imageUrl]);

  // Canlı Kamera Senkronizasyonu (BroadcastChannel)
  useEffect(() => {
    const bc = new BroadcastChannel("frp_map_camera_sync");
    channelRef.current = bc;

    // Oyuncuysa DM'in kamera hareketini dinle ve uygula
    if (!isDm) {
      bc.onmessage = (event) => {
        if (event.data?.type === "MAP_VIEWPORT_CHANGE") {
          setStageScale(event.data.scale);
          setStagePos({ x: event.data.x, y: event.data.y });
        }
      };
    }

    return () => {
      bc.close();
    };
  }, [isDm]);

  // DM kamera konumunu oyunculara yayınlar
  const broadcastViewport = (scale: number, pos: { x: number; y: number }) => {
    if (isDm && channelRef.current) {
      channelRef.current.postMessage({
        type: "MAP_VIEWPORT_CHANGE",
        scale,
        x: pos.x,
        y: pos.y,
      });
    }
  };

  // Yakınlaşma / Uzaklaşma (Pan & Zoom)
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.12;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.15, Math.min(5, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setStageScale(clampedScale);
    setStagePos(newPos);
    broadcastViewport(clampedScale, newPos);
  };

  const handleDragMove = (e: any) => {
    if (e.target === e.target.getStage()) {
      const newPos = { x: e.target.x(), y: e.target.y() };
      setStagePos(newPos);
      broadcastViewport(stageScale, newPos);
    }
  };

  return (
    <div className="relative w-full h-[450px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 select-none flex items-center justify-center">
      {/* Kontrol Butonları */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur p-1.5 rounded-xl border border-slate-800 shadow-xl">
        <button
          onClick={() => {
            const nextScale = Math.min(5, stageScale * 1.25);
            setStageScale(nextScale);
            broadcastViewport(nextScale, stagePos);
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition"
          title="Yakınlaş"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const nextScale = Math.max(0.15, stageScale / 1.25);
            setStageScale(nextScale);
            broadcastViewport(nextScale, stagePos);
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition"
          title="Uzaklaş"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { 
            setStageScale(1); 
            setStagePos({ x: 0, y: 0 }); 
            broadcastViewport(1, { x: 0, y: 0 });
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition"
          title="Sıfırla"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {imageObj ? (
        <Stage
          width={900}
          height={450}
          onWheel={handleWheel}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          draggable={isDm} // Sadece DM haritayı sürükleyebilir, oyuncuda otomatik kayar
          onDragMove={handleDragMove}
          onDragEnd={handleDragMove}
        >
          <Layer>
            <KonvaImage image={imageObj} width={dimensions.width} height={dimensions.height} />
          </Layer>
        </Stage>
      ) : (
        <div className="text-center space-y-2 p-8 text-slate-600">
          <p className="text-sm font-medium">Aktif bir evren haritası yüklü değil.</p>
          <p className="text-xs text-slate-700">DM harita yüklediğinde burada simültane görüntülenecektir.</p>
        </div>
      )}
    </div>
  );
}