import { NextRequest, NextResponse } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

// In-memory store for socket connections
const userSockets = new Map<string, string>(); // userId -> socketId

declare global {
  var io: SocketIOServer | undefined;
}

export async function GET(req: NextRequest) {
  if (!global.io) {
    return NextResponse.json({ error: "Socket server not initialized" }, { status: 500 });
  }
  return NextResponse.json({ status: "Socket server running" });
}

export function getIO() {
  return global.io;
}

export function getUserSockets() {
  return userSockets;
}
