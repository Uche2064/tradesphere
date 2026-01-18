"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/authStore";

interface WebSocketEvents {
  "stock:update": (data: {
    type: "STOCK_UPDATE";
    payload: {
      productId: string;
      oldQuantity: number;
      newQuantity: number;
      reason: string;
    };
    timestamp: Date;
    companyId: string;
    storeId: string;
  }) => void;
  "sale:completed": (data: {
    type: "SALE_COMPLETED";
    payload: {
      saleId: string;
      saleNumber: string;
      total: number;
      items: Array<{
        productName: string;
        quantity: number;
        total: number;
      }>;
    };
    timestamp: Date;
    companyId: string;
    storeId: string;
  }) => void;
  "stock:low": (data: {
    type: "LOW_STOCK_ALERT";
    payload: {
      productId: string;
      productName: string;
      currentQuantity: number;
      minQuantity: number;
    };
    timestamp: Date;
    companyId: string;
    storeId: string;
  }) => void;
}

export function useWebSocket() {
  const { accessToken } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    const socket = io(socketUrl, {
      path: "/api/socket",
      auth: {
        token: accessToken,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ WebSocket connecté");
      setIsConnected(true);
      setError(null);
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket déconnecté");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erreur de connexion WebSocket:", err);
      setError(err.message);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  const on = useCallback(<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback as any);
    }
  }, []);

  const off = useCallback(<K extends keyof WebSocketEvents>(
    event: K,
    callback?: WebSocketEvents[K]
  ) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback as any);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    on,
    off,
    emit,
  };
}
