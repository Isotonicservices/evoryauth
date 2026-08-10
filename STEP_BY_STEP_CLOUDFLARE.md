# STEP-BY-STEP: Deploy EvoryAuth to Cloudflare with Custom Domain

## Prerequisites
- Cloudflare account with custom domain already set up
- Neon.tech account (free PostgreSQL database)
- Node.js installed on your computer
- Git installed on your computer

---

## STEP 1: Set Up PostgreSQL Database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up for free
2. Click "Create a project"
3. Give it a name (e.g., "evoryauth-db")
4. Select a region (choose one closest to your users)
5. Click "Create Project"
6. Copy the **Connection String** - it looks like:
   ```
   postgresql://username:password@ep-cool-region.aws.neon.tech/neondb?sslmode=require
   ```
7. Save this somewhere safe - you'll need it

---

## STEP 2: Prepare Your Project

1. Open your project folder in terminal:
   ```bash
   cd c:/Users/hyperion/Downloads/evoryauth/evoryauth
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```bash
   notepad .env
   ```
   Add these lines:
   ```env
   DATABASE_URL=postgresql://username:password@ep-cool-region.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=make-up-a-random-long-secret-string-here
   ```
   Replace the DATABASE_URL with your Neon connection string from Step 1.

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Push database schema to Neon:
   ```bash
   npx prisma db push
   ```
   You should see: "Database schema is synchronized."

---

## STEP 3: Install Wrangler and Login

1. Install Wrangler globally:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```
   This will open a browser window - login to your Cloudflare account and authorize Wrangler.

---

## STEP 4: Configure Wrangler

1. Your `wrangler.toml` file should already be configured. Check it looks like this:
   ```toml
   name = "evoryauth"
   compatibility_date = "2024-01-01"
   compatibility_flags = ["nodejs_compat"]

   [vars]
   NODE_ENV = "production"
   ```

2. Set your secrets in Cloudflare:
   ```bash
   wrangler secret put DATABASE_URL
   ```
   Paste your Neon connection string when prompted.

   ```bash
   wrangler secret put JWT_SECRET
   ```
   Paste your JWT secret from your `.env` file.

---

## STEP 5: Build the Project

1. Build the Next.js application:
   ```bash
   npm run build
   ```
   This creates a `.next` folder with your production build.

---

## STEP 6: Deploy to Cloudflare Pages

### Option A: Direct Deployment (Faster)

1. Deploy directly with Wrangler:
   ```bash
   wrangler pages deploy .next --project-name=evoryauth
   ```

2. When asked:
   - "Create a new project?" → Yes
   - "Production branch?" → main (or your branch name)
   - "Build command?" → npm run build  
   - "Build output directory?" → .next

3. Wait for deployment - you'll get a URL like:
   ```
   https://evoryauth.pages.dev
   ```

### Option B: GitHub Integration (Recommended for updates)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/evoryauth.git
   git push -u origin main
   ```

2. Go to Cloudflare Dashboard:
   - Click "Workers & Pages" → "Create application"
   - Click "Pages" → "Connect to Git"
   - Select your GitHub repository
   - Authorize Cloudflare to access your repo

3. Configure build settings:
   - **Project name**: evoryauth
   - **Production branch**: main
   - **Framework preset**: Next.js
   - **Build command**: npm run build
   - **Build output directory**: .next

4. Add environment variables:
   - Click "Settings" → "Environment variables"
   - Add: `DATABASE_URL` = your Neon connection string
   - Add: `JWT_SECRET` = your JWT secret

5. Click "Save and Deploy"

---

## STEP 7: Connect Your Custom Domain

1. In Cloudflare Dashboard, go to your Pages project
2. Click "Custom domains"
3. Click "Set up a custom domain"
4. Enter your custom domain (e.g., `auth.yourdomain.com`)
5. Click "Continue"

6. Cloudflare will show you DNS records to add. Since your domain is already on Cloudflare:
   - Go to your domain's DNS settings in Cloudflare
   - Add the CNAME record they show you
   - It usually looks like:
     - Type: CNAME
     - Name: auth
     - Target: your-project.pages.dev
     - Proxy status: Proxied (orange cloud)

7. Wait for DNS to propagate (usually 1-5 minutes)

8. Back in Pages, click "Activate domain"

---

## STEP 8: Test Your Deployment

1. Visit your custom domain: `https://auth.yourdomain.com`
2. Try to register a new user
3. Check if the application works
4. If you see errors, check the logs in Cloudflare Dashboard

---

## STEP 9: Troubleshooting

### Database Connection Error
- Verify your DATABASE_URL is correct
- Make sure SSL is enabled in the connection string
- Check Neon dashboard to see if there are connection issues

### Build Errors
- Run `npm install` again
- Run `npx prisma generate`
- Delete `.next` folder and rebuild: `npm run build`

### Custom Domain Not Working
- Check DNS records in Cloudflare
- Wait 10-15 minutes for DNS propagation
- Make sure SSL/TLS is set to "Full" in Cloudflare SSL settings

### 404 Errors
- Make sure you deployed the `.next` folder
- Check build output directory setting in Pages

---

## Summary of Commands

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma generate
npx prisma db push

# 3. Build
npm run build

# 4. Deploy
wrangler pages deploy .next --project-name=evoryauth

# 5. Set secrets (only once)
wrangler secret put DATABASE_URL
wrangler secret put JWT_SECRET
```

---

## What You Need to Have Ready

- Neon PostgreSQL connection string
- A random JWT secret (make one up)
- Your custom domain name
- Cloudflare account login
- GitHub account (if using Option B)

That's it! Your EvoryAuth application should now be live on your custom domain.
