# Hyper Auth - Premium Licensing & Security Platform

Hyper Auth is a premium software licensing and authentication system featuring aesthetic **Glassmorphic Cyber-themed UI** dashboards, an Admin monitoring console, a secure CDN distribution network, and cryptographic client-side SDK bindings.

## Features

- **Developer Dashboard**: Analyze application logs, chart live traffic stats, create licenses, and upload binaries to the secure CDN.
- **Admin Control Panel**: Full server visibility. Ban users, upgrade plans, and analyze global system audits.
- **SDK Handshake Cryptography**: Dynamic key exchange using AES-256-GCM keeps client APIs secure against packets decryption.
- **Hardware Identifier Locks (HWID)**: Automatically binds subscriptions to machine components.
- **Flexible Expiration**: 1 Day, 7 Days, 30 Days, Lifetime, or Custom durations.

---

## Getting Started

### 1. Installation

Run installation commands inside the root directory:

```bash
npm install
```

### 2. Configure Database & Environment

Hyper Auth is configured with a default SQLite connection file `dev.db` for zero-configuration, immediate local testing:

```bash
# Apply Prisma Schema to Database
npx prisma db push
```

For production environments, swap the database provider inside [schema.prisma](file:///C:/Users/Xploit/.gemini/antigravity/scratch/evoryauth/prisma/schema.prisma) to PostgreSQL, adjust your `.env` variables, and redeploy.

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## Production Deployment

### Option A: Docker Compose (Recommended)

```bash
docker-compose up --build -d
```

### Option B: PM2 & Nginx Proxy

Build production bundles and boot PM2 clusters:

```bash
npm run build
pm2 start ecosystem.config.js
```

Configure Nginx reverse proxies with SSL as outlined inside [nginx.conf](file:///C:/Users/Xploit/.gemini/antigravity/scratch/evoryauth/nginx.conf).
