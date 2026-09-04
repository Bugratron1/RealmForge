import Peer, { DataConnection } from "peerjs";

export const getPeerRoomId = (roomId: string) => `realmforge-${roomId.toLowerCase()}`;

export class PeerNetwork {
  peer: Peer | null = null;
  connections: DataConnection[] = [];
  onDataCallback: (data: any) => void = () => {};
  onConnectionCallback: () => void = () => {};

  // DM için Host (Sunucu) Kurulumu
  initHost(roomId: string, onReady: (peerId: string) => void, onError?: (err: any) => void) {
    const peerId = getPeerRoomId(roomId);
    
    if (this.peer) {
      this.destroy();
    }

    const peer = new Peer(peerId, {
      debug: 2,
    });

    peer.on("open", (id) => {
      console.log("Peer Host Açıldı, ID:", id);
      onReady(id);
    });

    peer.on("connection", (conn) => {
      console.log("Yeni bir oyuncu bağlandı!", conn.peer);
      this.connections.push(conn);
      this.onConnectionCallback();

      conn.on("data", (data) => {
        this.onDataCallback(data);
        this.connections.forEach((c) => {
          if (c !== conn && c.open) {
            c.send(data);
          }
        });
      });

      conn.on("close", () => {
        console.log("Bir oyuncu bağlantıyı kesti.");
        this.connections = this.connections.filter((c) => c !== conn);
      });
    });

    peer.on("error", (err) => {
      console.error("Peer Host Hatası:", err);
      if (onError) onError(err);
    });

    this.peer = peer;
  }

  // Oyuncu için Client (İstemci) Kurulumu
  initClient(roomId: string, onConnected: () => void, onError: (err: any) => void) {
    const hostPeerId = getPeerRoomId(roomId);
    
    if (this.peer) {
      this.destroy();
    }

    // Hataya sebep olan kısım düzeltildi:
    const clientId = `client-${Math.random().toString(36).substring(2, 9)}`;
    const peer = new Peer(clientId, { debug: 2 });

    peer.on("open", () => {
      console.log("Client Peer Açıldı, DM'e bağlanılıyor:", hostPeerId);
      const conn = peer.connect(hostPeerId, { reliable: true });

      conn.on("open", () => {
        console.log("DM Masasına Başarıyla Bağlandı!");
        this.connections = [conn];
        onConnected();
      });

      conn.on("data", (data) => {
        this.onDataCallback(data);
      });

      conn.on("error", (err) => {
        console.error("Client Connection Error:", err);
        onError(err);
      });
    });

    peer.on("error", (err) => {
      console.error("Client Peer Error:", err);
      onError(err);
    });

    this.peer = peer;
  }

  send(data: any) {
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(data);
      }
    });
  }

  destroy() {
    this.connections.forEach((c) => c.close());
    this.connections = [];
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

export const peerNetwork = new PeerNetwork();