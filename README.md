# WhatsApp Clone

A full-featured WhatsApp clone built with **Next.js 15**, **MongoDB**, **Socket.io**, and **Cloudinary**.

## Features
- Real-time messaging with Socket.io
- Text, image, video, audio, and document messages
- Message status (sent, delivered, read with blue ticks)
- Reply to messages, delete for everyone/me
- Emoji reactions on messages
- Typing indicators
- Group chats with admin controls
- Online/offline presence + last seen
- JWT authentication with HttpOnly cookies
- Profile editing with avatar upload (Cloudinary)
- Search users by name, email, or phone
- Unread message count badges
- Full-screen image/video viewer

## Tech Stack
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS
- **State**: Zustand
- **Real-time**: Socket.io (custom Node.js server)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + HttpOnly cookies
- **Media**: Cloudinary
- **Utils**: date-fns, react-hot-toast

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```
Fill in:
- `MONGODB_URI` – MongoDB connection string
- `JWT_SECRET` – Random secret (openssl rand -base64 32)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### 3. Run development server
```bash
npm run dev
```

Open http://localhost:3000

## Project Structure
```
app/api/          – REST API routes
app/chat/         – Main chat page
components/chat/  – All UI components
hooks/            – useSocket hook
lib/              – DB, auth, Cloudinary utils
models/           – Mongoose schemas (User, Conversation, Message)
store/            – Zustand stores
server.js         – Custom Socket.io server
middleware.ts     – Route protection
```

## Socket Events
- `message:send/new` – Real-time messaging
- `typing:start/stop` – Typing indicators
- `message:read` – Read receipts
- `user:status` – Online/offline presence
- `call:initiate/answer/end` – Voice/Video call signaling (scaffolded)

## Deployment
Requires a persistent server (Railway, Render, VPS) for Socket.io support.
```bash
npm run build
npm start
```
