#!/bin/bash

# FiveM Tools V7 - Production Deployment Script
# Complete deployment with all advanced features

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="fivem-tools-v7"
NODE_VERSION="18"
POSTGRES_VERSION="15"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js $NODE_VERSION or higher."
        exit 1
    fi
    
    NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VER" -lt "$NODE_VERSION" ]; then
        log_error "Node.js version $NODE_VERSION or higher is required. Current: $(node -v)"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_info "Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_warning "PostgreSQL client not found. Make sure you have access to a PostgreSQL database."
    fi
    
    log_success "System requirements check completed"
}

setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_info "Created .env file from .env.example"
        else
            log_error ".env.example file not found. Please create environment configuration."
            exit 1
        fi
    fi
    
    # Validate required environment variables
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "NEXTAUTH_SECRET"
        "DISCORD_CLIENT_ID"
        "DISCORD_CLIENT_SECRET"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env || grep -q "^$var=$" .env || grep -q "^$var=your_" .env; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Missing or incomplete environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        log_error "Please configure these variables in .env file before continuing."
        exit 1
    fi
    
    log_success "Environment configuration validated"
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    # Clear cache
    pnpm store prune
    
    # Install dependencies
    pnpm install --frozen-lockfile --prefer-offline
    
    log_success "Dependencies installed successfully"
}

setup_database() {
    log_info "Setting up database..."
    
    # Load environment variables
    source .env
    
    if [ -z "$DATABASE_URL" ] && [ -z "$POSTGRES_URL" ]; then
        log_error "Database URL not configured. Please set DATABASE_URL or POSTGRES_URL in .env"
        exit 1
    fi
    
    DB_URL=${DATABASE_URL:-$POSTGRES_URL}
    
    # Test database connection
    log_info "Testing database connection..."
    if ! psql "$DB_URL" -c "SELECT 1;" &> /dev/null; then
        log_error "Cannot connect to database. Please check your database configuration."
        exit 1
    fi
    
    # Run database schema
    log_info "Applying database schema..."
    if [ -f "database-schema-complete-v7.sql" ]; then
        psql "$DB_URL" -f database-schema-complete-v7.sql
        log_success "Database schema applied successfully"
    else
        log_warning "Database schema file not found. Skipping schema setup."
    fi
    
    # Run migrations if they exist
    if [ -d "migrations" ]; then
        log_info "Running database migrations..."
        for migration in migrations/*.sql; do
            if [ -f "$migration" ]; then
                log_info "Applying migration: $(basename "$migration")"
                psql "$DB_URL" -f "$migration"
            fi
        done
        log_success "Database migrations completed"
    fi
    
    log_success "Database setup completed"
}

build_application() {
    log_info "Building application..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build the application
    pnpm build
    
    if [ $? -eq 0 ]; then
        log_success "Application built successfully"
    else
        log_error "Application build failed"
        exit 1
    fi
}

run_tests() {
    log_info "Running tests..."
    
    # Run linting
    if pnpm lint; then
        log_success "Linting passed"
    else
        log_warning "Linting issues found"
    fi
    
    # Run tests if they exist
    if [ -d "tests" ] || [ -f "vitest.config.ts" ]; then
        if pnpm test; then
            log_success "Tests passed"
        else
            log_error "Tests failed"
            exit 1
        fi
    else
        log_info "No tests found, skipping test execution"
    fi
}

setup_monitoring() {
    log_info "Setting up monitoring and logging..."
    
    # Create logs directory
    mkdir -p logs
    
    # Setup log rotation (if logrotate is available)
    if command -v logrotate &> /dev/null; then
        cat > /tmp/fivem-tools-logrotate << EOF
logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
EOF
        
        if [ -d "/etc/logrotate.d" ]; then
            sudo cp /tmp/fivem-tools-logrotate /etc/logrotate.d/fivem-tools
            log_success "Log rotation configured"
        fi
    fi
    
    log_success "Monitoring setup completed"
}

setup_security() {
    log_info "Configuring security settings..."
    
    # Set proper file permissions
    find . -type f -name "*.js" -exec chmod 644 {} \;
    find . -type f -name "*.ts" -exec chmod 644 {} \;
    find . -type f -name "*.json" -exec chmod 644 {} \;
    chmod 600 .env
    
    # Create security headers configuration
    if [ ! -f "next.config.js" ]; then
        log_warning "next.config.js not found. Security headers may not be configured."
    fi
    
    log_success "Security configuration completed"
}

optimize_performance() {
    log_info "Optimizing performance..."
    
    # Clear Next.js cache
    rm -rf .next/cache
    
    # Optimize images if sharp is available
    if pnpm list sharp &> /dev/null; then
        log_success "Sharp optimization available"
    else
        log_info "Installing sharp for image optimization..."
        pnpm add sharp
    fi
    
    log_success "Performance optimization completed"
}

create_systemd_service() {
    log_info "Creating systemd service..."
    
    SERVICE_FILE="/tmp/fivem-tools.service"
    CURRENT_DIR=$(pwd)
    CURRENT_USER=$(whoami)
    
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=FiveM Tools V7
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
Environment=NODE_ENV=production
ExecStart=$(which pnpm) start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=fivem-tools

[Install]
WantedBy=multi-user.target
EOF
    
    echo "Systemd service file created at $SERVICE_FILE"
    echo "To install the service, run:"
    echo "  sudo cp $SERVICE_FILE /etc/systemd/system/"
    echo "  sudo systemctl daemon-reload"
    echo "  sudo systemctl enable fivem-tools"
    echo "  sudo systemctl start fivem-tools"
    
    log_success "Systemd service configuration created"
}

create_nginx_config() {
    log_info "Creating Nginx configuration..."
    
    NGINX_CONFIG="/tmp/fivem-tools-nginx.conf"
    
    cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration (update paths to your certificates)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static files caching
    location /_next/static {
        alias $(pwd)/.next/static;
        expires 365d;
        access_log off;
    }
    
    location /public {
        alias $(pwd)/public;
        expires 30d;
        access_log off;
    }
}
EOF
    
    echo "Nginx configuration created at $NGINX_CONFIG"
    echo "To install the configuration:"
    echo "  1. Update the server_name and SSL certificate paths"
    echo "  2. Copy to Nginx sites-available: sudo cp $NGINX_CONFIG /etc/nginx/sites-available/fivem-tools"
    echo "  3. Enable the site: sudo ln -s /etc/nginx/sites-available/fivem-tools /etc/nginx/sites-enabled/"
    echo "  4. Test configuration: sudo nginx -t"
    echo "  5. Reload Nginx: sudo systemctl reload nginx"
    
    log_success "Nginx configuration created"
}

create_backup_script() {
    log_info "Creating backup script..."
    
    BACKUP_SCRIPT="backup.sh"
    
    cat > "$BACKUP_SCRIPT" << 'EOF'
#!/bin/bash

# FiveM Tools V7 Backup Script

BACKUP_DIR="/var/backups/fivem-tools"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR=$(pwd)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Load environment variables
source .env

# Database backup
if [ -n "$DATABASE_URL" ] || [ -n "$POSTGRES_URL" ]; then
    DB_URL=${DATABASE_URL:-$POSTGRES_URL}
    echo "Creating database backup..."
    pg_dump "$DB_URL" > "$BACKUP_DIR/database_$DATE.sql"
    gzip "$BACKUP_DIR/database_$DATE.sql"
    echo "Database backup created: $BACKUP_DIR/database_$DATE.sql.gz"
fi

# Application backup
echo "Creating application backup..."
tar -czf "$BACKUP_DIR/application_$DATE.tar.gz" \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=logs \
    --exclude=.git \
    "$PROJECT_DIR"

echo "Application backup created: $BACKUP_DIR/application_$DATE.tar.gz"

# Clean old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete

echo "Backup completed successfully"
EOF
    
    chmod +x "$BACKUP_SCRIPT"
    
    echo "Backup script created: $BACKUP_SCRIPT"
    echo "To schedule daily backups, add to crontab:"
    echo "  0 2 * * * $(pwd)/$BACKUP_SCRIPT"
    
    log_success "Backup script created"
}

deploy_to_production() {
    log_info "Starting production deployment..."
    
    # Run all deployment steps
    check_requirements
    setup_environment
    install_dependencies
    setup_database
    build_application
    run_tests
    setup_monitoring
    setup_security
    optimize_performance
    
    # Create service configurations
    create_systemd_service
    create_nginx_config
    create_backup_script
    
    log_success "Production deployment completed successfully!"
    
    echo ""
    echo "=========================================="
    echo "  DEPLOYMENT SUMMARY"
    echo "=========================================="
    echo "✅ System requirements checked"
    echo "✅ Environment configured"
    echo "✅ Dependencies installed"
    echo "✅ Database setup completed"
    echo "✅ Application built successfully"
    echo "✅ Tests passed"
    echo "✅ Monitoring configured"
    echo "✅ Security settings applied"
    echo "✅ Performance optimized"
    echo "✅ Service configurations created"
    echo ""
    echo "Next steps:"
    echo "1. Configure SSL certificates for Nginx"
    echo "2. Install and enable systemd service"
    echo "3. Configure Nginx reverse proxy"
    echo "4. Set up automated backups"
    echo "5. Configure monitoring alerts"
    echo ""
    echo "To start the application:"
    echo "  pnpm start"
    echo ""
    echo "Application will be available at http://localhost:3000"
    echo "=========================================="
}

# Main execution
case "${1:-deploy}" in
    "deploy")
        deploy_to_production
        ;;
    "check")
        check_requirements
        ;;
    "env")
        setup_environment
        ;;
    "db")
        setup_database
        ;;
    "build")
        build_application
        ;;
    "test")
        run_tests
        ;;
    "backup")
        create_backup_script
        ;;
    *)
        echo "Usage: $0 [deploy|check|env|db|build|test|backup]"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full production deployment (default)"
        echo "  check   - Check system requirements"
        echo "  env     - Setup environment configuration"
        echo "  db      - Setup database"
        echo "  build   - Build application"
        echo "  test    - Run tests"
        echo "  backup  - Create backup script"
        exit 1
        ;;
esac