# Cloudflare Deployment Guide

This guide will help you deploy EvoryAuth to Cloudflare Pages using Wrangler.

## Prerequisites

1. **Cloudflare Account**: Create a free account at [cloudflare.com](https://cloudflare.com)
2. **Neon Database**: Create a free PostgreSQL database at [neon.tech](https://neon.tech) (Cloudflare D1 doesn't work well with Prisma)
3. **Node.js**: Ensure you have Node.js 18+ installed
4. **Git**: Your project should be in a Git repository

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file with your Neon database URL:

```env
DATABASE_URL=postgresql://username:password@ep-cool-region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-jwt-secret-here
```

### 3. Update Wrangler Configuration

Edit `wrangler.toml` and update the following:

- Remove the D1 database section (we're using Neon instead)
- Add your environment variables

Updated `wrangler.toml`:

```toml
name = "evoryauth"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
NODE_ENV = "production"

# Environment variables (secrets should be set via wrangler secret)
# DATABASE_URL should be set as a secret
```

### 4. Set Secrets in Wrangler

```bash
npx wrangler secret put DATABASE_URL
# Paste your Neon database URL when prompted

npx wrangler secret put JWT_SECRET
# Paste your JWT secret when prompted
```

### 5. Push Database Schema

```bash
npx prisma generate
npx prisma db push
```

### 6. Build the Project

```bash
npm run build
```

### 7. Deploy to Cloudflare Pages

#### Option A: Direct Deployment with Wrangler

```bash
npx wrangler pages deploy .next --project-name=evoryauth
```

#### Option B: Connect GitHub Repository (Recommended)

1. Push your code to GitHub
2. Go to Cloudflare Dashboard → Pages → Create a project
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Environment variables**: Add your `DATABASE_URL` and `JWT_SECRET`

### 8. Configure Custom Domain (Optional)

1. In Cloudflare Pages project settings, add your custom domain
2. Update DNS records as instructed by Cloudflare

## Important Notes

- **Database**: We switched from SQLite to PostgreSQL (Neon) because Prisma doesn't support Cloudflare D1 well
- **File Uploads**: For file uploads, consider using Cloudflare R2 or keep using the database storage
- **Sessions**: For session storage, you can use Cloudflare KV or keep using database sessions
- **Edge Functions**: Some Next.js features may need adjustment for the edge runtime

## Troubleshooting

### Build Errors

If you encounter build errors, ensure:
- All dependencies are installed
- Prisma client is generated: `npx prisma generate`
- Environment variables are set correctly

### Database Connection Issues

- Verify your Neon database URL is correct
- Ensure SSL mode is enabled in the connection string
- Check that your database allows connections from Cloudflare IPs

### Runtime Errors

- Some Node.js modules may not work in the edge runtime
- If you encounter module errors, you may need to switch to Node.js runtime in wrangler.toml

## Alternative: Cloudflare Workers with @cloudflare/next-on-pages

For better Cloudflare integration, you can use the official adapter:

```bash
npm install @cloudflare/next-on-pages
```

Then update your build script and use the adapter for better edge compatibility.
