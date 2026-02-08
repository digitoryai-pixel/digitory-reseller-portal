# Deploying Digitory Reseller Portal to VPS

## Prerequisites
- VPS with Ubuntu 22.04+ (DigitalOcean, AWS EC2, Linode, etc.)
- Docker and Docker Compose installed
- Domain name (optional, but recommended)

## Quick Start

### 1. SSH into your VPS
```bash
ssh root@your-server-ip
```

### 2. Install Docker (if not installed)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 3. Clone the repository
```bash
git clone https://github.com/your-username/digitory-reseller-portal.git
cd digitory-reseller-portal
```

### 4. Configure environment
```bash
# Copy the example env file
cp .env.production.example .env

# Generate a secure secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Edit the .env file with your values
nano .env
```

Update these values in `.env`:
- `POSTGRES_PASSWORD` - Strong database password
- `NEXTAUTH_URL` - Your domain (e.g., https://portal.digitory.com)
- `NEXTAUTH_SECRET` - The generated secret
- `SEED_DATABASE=true` - For first deployment only

### 5. Deploy
```bash
# First deployment (with seeding)
docker-compose up -d --build

# Check logs
docker-compose logs -f app
```

### 6. Verify deployment
```bash
curl http://localhost:3000
```

## Default Login Credentials
After seeding, use these to log in:

**Admin:**
- Email: admin@digitory.com
- Password: admin123

**Reseller:**
- Email: reseller@example.com
- Password: reseller123

⚠️ **Change these passwords immediately after first login!**

## Setting up HTTPS with Nginx

### Install Nginx and Certbot
```bash
apt update
apt install nginx certbot python3-certbot-nginx
```

### Configure Nginx
```bash
nano /etc/nginx/sites-available/digitory
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and get SSL:
```bash
ln -s /etc/nginx/sites-available/digitory /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
certbot --nginx -d your-domain.com
```

## Maintenance Commands

### View logs
```bash
docker-compose logs -f app
docker-compose logs -f db
```

### Restart services
```bash
docker-compose restart app
```

### Update application
```bash
git pull
docker-compose up -d --build
```

### Backup database
```bash
docker-compose exec db pg_dump -U digitory digitory_portal > backup.sql
```

### Restore database
```bash
cat backup.sql | docker-compose exec -T db psql -U digitory digitory_portal
```

## Troubleshooting

### App not starting
Check logs: `docker-compose logs app`

### Database connection issues
Ensure db service is healthy: `docker-compose ps`

### Permission errors
Make sure scripts are executable:
```bash
chmod +x scripts/docker-entrypoint.sh
```
