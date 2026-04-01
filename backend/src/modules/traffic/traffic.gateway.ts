import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface ViewerInfo {
  page: string;        // e.g. "/profiles" or "/"
  connectedAt: number;
  isAdmin: boolean;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/traffic',
})
export class TrafficGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(TrafficGateway.name);

  // socketId -> ViewerInfo
  private viewers = new Map<string, ViewerInfo>();

  /* ── Connection ─────────────────────────────────────────────────── */
  handleConnection(client: Socket) {
    const page = (client.handshake.query?.page as string) || '/';
    const isAdmin = client.handshake.query?.role === 'ADMIN';

    this.viewers.set(client.id, { page, connectedAt: Date.now(), isAdmin });

    if (isAdmin) {
      client.join('admin_room');
    }

    this.logger.log(`[Traffic] Connected: ${client.id} page=${page} admin=${isAdmin}`);
    this.broadcastStats();
  }

  /* ── Disconnect ─────────────────────────────────────────────────── */
  handleDisconnect(client: Socket) {
    this.viewers.delete(client.id);
    this.logger.log(`[Traffic] Disconnected: ${client.id}`);
    this.broadcastStats();
  }

  /* ── Page change (SPA navigation) ──────────────────────────────── */
  @SubscribeMessage('page_change')
  handlePageChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { page: string },
  ) {
    const info = this.viewers.get(client.id);
    if (info) {
      info.page = data.page || '/';
      this.broadcastStats();
    }
  }

  /* ── Build & broadcast stats ────────────────────────────────────── */
  buildStats() {
    const pageCounts: Record<string, number> = {};
    let total = 0;
    let guests = 0;
    let members = 0;

    for (const info of this.viewers.values()) {
      if (info.isAdmin) continue; // don't count admins in viewer stats
      total++;
      pageCounts[info.page] = (pageCounts[info.page] ?? 0) + 1;
    }

    // sort pages by count desc
    const pages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([page, count]) => ({ page, count }));

    return {
      total,
      pages,
      timestamp: Date.now(),
    };
  }

  broadcastStats() {
    const stats = this.buildStats();
    this.server.to('admin_room').emit('traffic_update', stats);
  }
}
