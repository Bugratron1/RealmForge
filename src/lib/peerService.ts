import Peer, { DataConnection } from "peerjs";

export const getPeerRoomId = (roomId: string) => `realmforge-${roomId.toLowerCase()}`;

export class PeerNetwork {
  peer: Peer | null = null;
  connections: DataConnection[] = [];
  onDataCallback: (data: any) => void = () => {};
  onConnectionCallback: () => void = () => {};

  initHost(roomId: string, onReady: (peerId: string) => void) {
    const peerId = getPeerRoomId(roomId);
    
    const peer = new Peer(peerId, {
      debug: 1,
    });

    peer.on("open", (id) => {
      onReady(id);
    });

    peer.on("connection", (conn) => {
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
        this.connections = this.connections.filter((c) => c !== conn);
      });
    });

    this.peer = peer;
  }

  initClient(roomId: string, onConnected: () => void, onError: (err: any) => void) {
    const hostPeerId = getPeerRoomId(roomId);
    const peer = new Peer({ debug: 1 });

    peer.on("open", () => {
      const conn = peer.connect(hostPeerId);

      conn.on("open", () => {
        this.connections = [conn];
        onConnected();
      });

      conn.on("data", (data) => {
        this.onDataCallback(data);
      });

      conn.on("error", (err) => {
        onError(err);
      });
    });

    peer.on("error", (err) => {
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
    if (this.peer) {
      this.peer.destroy();
    }
  }
}

export const peerNetwork = new PeerNetwork();