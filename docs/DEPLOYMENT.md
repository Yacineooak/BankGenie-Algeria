# BankGenie Deployment Guide

This guide provides comprehensive instructions for deploying BankGenie in various environments, from development to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Security Hardening](#security-hardening)
- [Monitoring Setup](#monitoring-setup)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements

#### Minimum Requirements

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Network**: 100Mbps

#### Recommended Requirements

- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Network**: 1Gbps

### Software Dependencies

```bash
# Node.js (18.0+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL (14.0+)
sudo apt-get install postgresql postgresql-contrib

# Redis (6.0+)
sudo apt-get install redis-server

# Nginx (reverse proxy)
sudo apt-get install nginx

# Certbot (SSL certificates)
sudo apt-get install certbot python3-certbot-nginx

# Git
sudo apt-get install git

# Process manager
sudo npm install -g pm2
```

## 🌍 Environment Setup

### 1. Create System User

```bash
# Create dedicated user for BankGenie
sudo adduser bankgenie
sudo usermod -aG sudo bankgenie

# Switch to bankgenie user
sudo su - bankgenie
```

### 2. SSH Key Setup

```bash
# Generate SSH key for deployment
ssh-keygen -t rsa -b 4096 -C "deploy@bankgenie.com"

# Add to GitHub (for private repositories)
cat ~/.ssh/id_rsa.pub
# Copy and add to GitHub Deploy Keys
```

### 3. Directory Structure

```bash
# Create application directories
mkdir -p /opt/bankgenie/{app,logs,backups,ssl}
sudo chown -R bankgenie:bankgenie /opt/bankgenie
```

## 🚀 Local Development

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/bankgenie.git
cd bankgenie

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env

# Setup database
createdb bankgenie_dev
npm run db:setup

# Start development server
npm run dev
```

### Development Environment Variables

```env
# .env.development
NODE_ENV=development
PORT=8080
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/bankgenie_dev
REDIS_URL=redis://localhost:6379/0

# Development keys (use secure keys in production)
JWT_SECRET=dev-jwt-secret-key-change-in-production
ENCRYPTION_KEY=dev-encryption-key-32-chars-long
SESSION_SECRET=dev-session-secret-key

# Feature flags for development
ENABLE_DEBUG_ROUTES=true
ENABLE_MOCK_BANKING_API=true
DISABLE_RATE_LIMITING=true
```

## 🏭 Production Deployment

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget gnupg2 software-properties-common

# Create swap file (if not exists)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Application Deployment

```bash
# Navigate to application directory
cd /opt/bankgenie/app

# Clone repository
git clone https://github.com/your-org/bankgenie.git .

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Setup environment
cp .env.production.example .env.production
```

### 3. Production Environment Variables

```env
# .env.production
NODE_ENV=production
PORT=3000
APP_URL=https://bankgenie.dz

# Database (use connection pooling)
DATABASE_URL=postgresql://bankgenie_user:secure_password@localhost:5432/bankgenie_prod
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Redis
REDIS_URL=redis://localhost:6379/1
REDIS_PASSWORD=secure_redis_password

# Security
JWT_SECRET=super-secure-jwt-secret-256-bits-minimum
ENCRYPTION_KEY=32-character-encryption-key-here
SESSION_SECRET=secure-session-secret-key-here

# SSL
HTTPS_ENABLED=true
SSL_CERT_PATH=/opt/bankgenie/ssl/fullchain.pem
SSL_KEY_PATH=/opt/bankgenie/ssl/privkey.pem

# Banking APIs
BANK_API_BASE_URL=https://api.banking.dz
BANK_API_KEY=production-api-key
BANK_API_SECRET=production-api-secret
BANK_API_TIMEOUT=30000

# External services
EMAIL_SERVICE_URL=https://email.service.com
SMS_SERVICE_URL=https://sms.service.com
NOTIFICATION_WEBHOOK_URL=https://webhook.service.com

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_PORT=8081

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL=true

# Security headers
SECURITY_HSTS_MAX_AGE=31536000
SECURITY_CONTENT_SECURITY_POLICY=true
SECURITY_X_FRAME_OPTIONS=DENY
```

### 4. Database Setup

```bash
# Create production database
sudo -u postgres createdb bankgenie_prod

# Create database user
sudo -u postgres psql -c "CREATE USER bankgenie_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bankgenie_prod TO bankgenie_user;"

# Run migrations
npm run db:migrate:prod

# Create initial admin user
npm run db:seed:admin
```

### 5. Process Management with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bankgenie',
    script: 'dist/server/node-build.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/opt/bankgenie/logs/error.log',
    out_file: '/opt/bankgenie/logs/output.log',
    log_file: '/opt/bankgenie/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',

    // Monitoring
    monitoring: true,
    pmx: true,

    // Auto restart
    watch: false,
    ignore_watch: ['node_modules', 'logs'],

    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup auto-startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u bankgenie --hp /home/bankgenie
```

### 6. Nginx Configuration

```bash
# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/bankgenie << 'EOF'
# Rate limiting
limit_req_zone $binary_remote_addr zone=bankgenie_api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=bankgenie_auth:10m rate=5r/s;

# Upstream servers
upstream bankgenie_backend {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name bankgenie.dz www.bankgenie.dz;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bankgenie.dz www.bankgenie.dz;

    # SSL Configuration
    ssl_certificate /opt/bankgenie/ssl/fullchain.pem;
    ssl_certificate_key /opt/bankgenie/ssl/privkey.pem;
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' wss:; frame-ancestors 'none';" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # File upload limits
    client_max_body_size 10M;
    client_body_timeout 60;
    client_header_timeout 60;

    # Logging
    access_log /opt/bankgenie/logs/nginx_access.log;
    error_log /opt/bankgenie/logs/nginx_error.log;

    # API routes with rate limiting
    location /api/ {
        limit_req zone=bankgenie_api burst=20 nodelay;

        proxy_pass http://bankgenie_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 30;
        proxy_send_timeout 30;
        proxy_read_timeout 30;
    }

    # Auth routes with stricter rate limiting
    location /api/auth/ {
        limit_req zone=bankgenie_auth burst=5 nodelay;

        proxy_pass http://bankgenie_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://bankgenie_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files with caching
    location /assets/ {
        alias /opt/bankgenie/app/dist/spa/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Main application
    location / {
        proxy_pass http://bankgenie_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Handle SPA routing
        try_files $uri $uri/ @fallback;
    }

    location @fallback {
        proxy_pass http://bankgenie_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        access_log off;
        proxy_pass http://bankgenie_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ \.(env|config|log)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/bankgenie /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL Certificate Setup

```bash
# Install Let's Encrypt certificate
sudo certbot --nginx -d bankgenie.dz -d www.bankgenie.dz

# Setup auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Docker Deployment

### 1. Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bankgenie -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=bankgenie:nodejs /app/dist ./dist
COPY --from=builder --chown=bankgenie:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=bankgenie:nodejs /app/package.json ./package.json

# Create logs directory
RUN mkdir -p /app/logs && chown bankgenie:nodejs /app/logs

# Switch to non-root user
USER bankgenie

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server/node-build.mjs"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  bankgenie:
    build: .
    container_name: bankgenie_app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://bankgenie:${DB_PASSWORD}@postgres:5432/bankgenie
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - postgres
      - redis
    networks:
      - bankgenie_network
    volumes:
      - ./logs:/app/logs
      - ./ssl:/app/ssl:ro
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:14-alpine
    container_name: bankgenie_db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=bankgenie
      - POSTGRES_USER=bankgenie
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - bankgenie_network
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bankgenie"]
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: bankgenie_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - bankgenie_network
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  nginx:
    image: nginx:alpine
    container_name: bankgenie_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs:/var/log/nginx
    depends_on:
      - bankgenie
    networks:
      - bankgenie_network

networks:
  bankgenie_network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### 3. Environment File for Docker

```env
# .env
DB_PASSWORD=secure_database_password_here
REDIS_PASSWORD=secure_redis_password_here
JWT_SECRET=super-secure-jwt-secret-key
ENCRYPTION_KEY=32-character-encryption-key-here
```

### 4. Docker Deployment Commands

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale application
docker-compose up -d --scale bankgenie=3

# Stop services
docker-compose down

# Update application
docker-compose pull
docker-compose up -d --force-recreate
```

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance Setup

```bash
# Launch EC2 instance (t3.medium or larger)
# Ubuntu 20.04 LTS
# Security group: Allow HTTP (80), HTTPS (443), SSH (22)

# Connect to instance
ssh -i "your-key.pem" ubuntu@your-instance-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.12.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. RDS Database Setup

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier bankgenie-prod \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username bankgenie \
    --master-user-password YOUR_PASSWORD \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxx
```

#### 3. ElastiCache Redis Setup

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
    --cache-cluster-id bankgenie-redis \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1
```

### DigitalOcean Deployment

#### 1. Droplet Creation

```bash
# Create droplet with Docker pre-installed
doctl compute droplet create bankgenie-prod \
    --image docker-20-04 \
    --size s-2vcpu-4gb \
    --region fra1 \
    --ssh-keys YOUR_SSH_KEY_ID
```

#### 2. Managed Database

```bash
# Create managed PostgreSQL database
doctl databases create bankgenie-db \
    --engine pg \
    --version 14 \
    --size db-s-1vcpu-1gb \
    --region fra1
```

### Google Cloud Platform

#### 1. Cloud Run Deployment

```yaml
# cloudbuild.yaml
steps:
  - name: "gcr.io/cloud-builders/docker"
    args: ["build", "-t", "gcr.io/$PROJECT_ID/bankgenie", "."]
  - name: "gcr.io/cloud-builders/docker"
    args: ["push", "gcr.io/$PROJECT_ID/bankgenie"]
  - name: "gcr.io/cloud-builders/gcloud"
    args:
      - "run"
      - "deploy"
      - "bankgenie"
      - "--image"
      - "gcr.io/$PROJECT_ID/bankgenie"
      - "--region"
      - "europe-west1"
      - "--platform"
      - "managed"
      - "--allow-unauthenticated"
```

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# UFW firewall setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2Ban for SSH protection
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 2. SSH Hardening

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Add these configurations:
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers bankgenie
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

### 3. Database Security

```bash
# PostgreSQL security
sudo nano /etc/postgresql/14/main/postgresql.conf
# listen_addresses = 'localhost'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# local   all             bankgenie                               md5
# host    all             bankgenie       127.0.0.1/32            md5
```

### 4. Application Security

```bash
# Set proper file permissions
chmod 750 /opt/bankgenie
chmod 640 /opt/bankgenie/app/.env.production
chown -R bankgenie:bankgenie /opt/bankgenie

# Setup log rotation
sudo nano /etc/logrotate.d/bankgenie
```

## 📊 Monitoring Setup

### 1. Application Monitoring

```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# Setup log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 2. System Monitoring

```bash
# Install monitoring stack
docker-compose -f monitoring/docker-compose.yml up -d

# Prometheus configuration
# Grafana dashboards
# AlertManager rules
```

### 3. Log Management

```bash
# Centralized logging with ELK stack
# Elasticsearch
# Logstash
# Kibana
```

## 💾 Backup & Recovery

### 1. Database Backup

```bash
# Automated database backup script
#!/bin/bash
# /opt/bankgenie/scripts/backup-db.sh

BACKUP_DIR="/opt/bankgenie/backups"
DB_NAME="bankgenie_prod"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h localhost -U bankgenie_user -W $DB_NAME | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

# Setup cron job
# 0 2 * * * /opt/bankgenie/scripts/backup-db.sh
```

### 2. Application Backup

```bash
# Application files backup
#!/bin/bash
# /opt/bankgenie/scripts/backup-app.sh

BACKUP_DIR="/opt/bankgenie/backups"
APP_DIR="/opt/bankgenie/app"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf $BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz -C $APP_DIR .

# Keep only last 7 days
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete
```

### 3. Recovery Procedures

```bash
# Database recovery
gunzip -c /opt/bankgenie/backups/db_backup_TIMESTAMP.sql.gz | psql -h localhost -U bankgenie_user bankgenie_prod

# Application recovery
cd /opt/bankgenie/app
tar -xzf /opt/bankgenie/backups/app_backup_TIMESTAMP.tar.gz
pm2 restart bankgenie
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check logs
pm2 logs bankgenie

# Check environment variables
pm2 env 0

# Check port availability
sudo netstat -tlnp | grep :3000

# Check disk space
df -h

# Check memory usage
free -h
```

#### Database Connection Issues

```bash
# Test database connection
psql -h localhost -U bankgenie_user -d bankgenie_prod -c "SELECT 1;"

# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### High CPU/Memory Usage

```bash
# Monitor processes
htop

# Check application metrics
pm2 monit

# Analyze heap dumps
node --inspect dist/server/node-build.mjs
```

#### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /opt/bankgenie/ssl/fullchain.pem -text -noout

# Test SSL configuration
openssl s_client -connect bankgenie.dz:443

# Renew Let's Encrypt certificate
sudo certbot renew --force-renewal
```

### Performance Optimization

#### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_transactions_user_id ON transactions(user_id);
CREATE INDEX CONCURRENTLY idx_transactions_created_at ON transactions(created_at);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM transactions WHERE user_id = 123;
```

#### Application Optimization

```bash
# Enable Node.js performance profiling
node --prof dist/server/node-build.mjs

# Analyze profile
node --prof-process isolate-*.log > profile.txt
```

### Emergency Procedures

#### Service Recovery

```bash
# Quick service restart
pm2 restart bankgenie

# Full system restart
sudo reboot

# Rollback to previous version
git checkout HEAD~1
npm run build
pm2 restart bankgenie
```

#### Database Recovery

```bash
# Emergency database restore
sudo systemctl stop postgresql
sudo -u postgres pg_restore -d bankgenie_prod /opt/bankgenie/backups/latest_backup.sql
sudo systemctl start postgresql
```

---

For additional support or questions about deployment, please contact our technical team at support@bankgenie.com or create an issue in the GitHub repository.
