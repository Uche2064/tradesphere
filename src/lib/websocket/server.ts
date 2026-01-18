import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyAccessToken } from "../jwt";
import prisma from "../../../lib/prisma";

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/api/socket",
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = verifyAccessToken(token);

      if (!decoded || typeof decoded === "string") {
        return next(new Error("Authentication error: Invalid token"));
      }

      // Charger l'utilisateur complet
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          role: true,
          company: true,
        },
      });

      if (!user || !user.isActive) {
        return next(new Error("Authentication error: User not found or inactive"));
      }

      // Attacher l'utilisateur au socket
      socket.data.user = user;

      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`✅ Utilisateur connecté: ${user.email} (${user.id})`);

    // Rejoindre les rooms selon la company
    if (user.companyId) {
      socket.join(`company:${user.companyId}`);
      console.log(`📍 Joined room: company:${user.companyId}`);
    }

    // Rejoindre la room du magasin si disponible
    if (user.storeId) {
      socket.join(`store:${user.storeId}`);
      console.log(`📍 Joined room: store:${user.storeId}`);
    }

    // SuperAdmin rejoint une room globale
    // TODO: Restore Role.type when schema is fixed
    const isSuperAdmin = user.role.name === "SuperAdmin" || user.role.name.toUpperCase() === "SUPERADMIN";
    if (isSuperAdmin) {
      socket.join("global");
      console.log(`📍 Joined room: global`);
    }

    // Événement de déconnexion
    socket.on("disconnect", () => {
      console.log(`❌ Utilisateur déconnecté: ${user.email}`);
    });

    // Événements personnalisés (pour futurs développements)
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() });
    });
  });

  console.log("🔌 WebSocket server initialized");

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("WebSocket server not initialized");
  }
  return io;
}

// Événements personnalisés pour l'application

export function emitStockUpdate(
  companyId: string,
  storeId: string,
  data: {
    productId: string;
    oldQuantity: number;
    newQuantity: number;
    reason: string;
  }
) {
  const socketIO = getIO();
  
  const eventData = {
    type: "STOCK_UPDATE",
    payload: data,
    timestamp: new Date(),
    companyId,
    storeId,
  };

  // Émettre vers le magasin spécifique (pour les vendeurs dans ce magasin)
  if (storeId) {
    socketIO.to(`store:${storeId}`).emit("stock:update", eventData);
  }

  // Émettre vers la company (pour le directeur)
  socketIO.to(`company:${companyId}`).emit("stock:update", eventData);
}

export function emitSaleCompleted(
  companyId: string,
  storeId: string,
  data: {
    saleId: string;
    saleNumber: string;
    total: number;
    items: Array<{
      productName: string;
      quantity: number;
      total: number;
    }>;
  }
) {
  const socketIO = getIO();

  const eventData = {
    type: "SALE_COMPLETED",
    payload: data,
    timestamp: new Date(),
    companyId,
    storeId,
  };

  // Émettre vers le magasin spécifique
  if (storeId) {
    socketIO.to(`store:${storeId}`).emit("sale:completed", eventData);
  }

  // Émettre vers la company
  socketIO.to(`company:${companyId}`).emit("sale:completed", eventData);

  // Émettre vers les SuperAdmins
  socketIO.to("global").emit("sale:completed", eventData);
}

export function emitLowStockAlert(
  companyId: string,
  storeId: string,
  data: {
    productId: string;
    productName: string;
    currentQuantity: number;
    minQuantity: number;
  }
) {
  const socketIO = getIO();

  // TODO: Restore store room when schema has storeId field
  // socketIO.to(`store:${storeId}`).emit("stock:low", {...});

  // Émettre vers la company
  socketIO.to(`company:${companyId}`).emit("stock:low", {
    type: "LOW_STOCK_ALERT",
    payload: data,
    timestamp: new Date(),
    companyId,
    storeId,
  });
}
