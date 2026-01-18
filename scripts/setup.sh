#!/bin/bash

# Script de configuration rapide pour TradeSphere
# Usage: bash scripts/setup.sh

set -e

echo "🚀 Configuration de TradeSphere..."
echo "===================================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier Node.js
echo ""
echo "${YELLOW}1. Vérification de Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "Installez Node.js >= 20.x depuis https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "${GREEN}✓ Node.js version: $NODE_VERSION${NC}"

# 2. Vérifier npm
echo ""
echo "${YELLOW}2. Vérification de npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "${GREEN}✓ npm version: $NPM_VERSION${NC}"

# 3. Copier .env si nécessaire
echo ""
echo "${YELLOW}3. Configuration de l'environnement...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo "${GREEN}✓ Fichier .env créé${NC}"
    echo "${YELLOW}⚠️  N'oubliez pas de configurer vos credentials dans .env${NC}"
else
    echo "${GREEN}✓ Fichier .env existe déjà${NC}"
fi

# 4. Installer les dépendances
echo ""
echo "${YELLOW}4. Installation des dépendances...${NC}"
npm install
echo "${GREEN}✓ Dépendances installées${NC}"

# 5. Générer Prisma Client
echo ""
echo "${YELLOW}5. Génération du client Prisma...${NC}"
npx prisma generate
echo "${GREEN}✓ Client Prisma généré${NC}"

# 6. Vérifier Docker (optionnel)
echo ""
echo "${YELLOW}6. Vérification de Docker (optionnel)...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "${GREEN}✓ Docker installé: $DOCKER_VERSION${NC}"
    
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_VERSION=$(docker-compose --version)
        echo "${GREEN}✓ Docker Compose installé: $DOCKER_COMPOSE_VERSION${NC}"
    fi
else
    echo "${YELLOW}⚠️  Docker n'est pas installé (optionnel)${NC}"
fi

# Récapitulatif
echo ""
echo "===================================="
echo "${GREEN}✅ Configuration terminée !${NC}"
echo "===================================="
echo ""
echo "📝 Prochaines étapes :"
echo ""
echo "1. Configurez vos credentials dans le fichier .env"
echo "   - DATABASE_URL (PostgreSQL)"
echo "   - JWT_ACCESS_SECRET et JWT_REFRESH_SECRET"
echo "   - GMAIL_USER et GMAIL_PASSWORD (pour les emails)"
echo ""
echo "2a. Avec Docker (recommandé) :"
echo "    make full-start"
echo ""
echo "2b. Sans Docker :"
echo "    npx prisma migrate dev"
echo "    npm run seed"
echo "    npm run dev"
echo ""
echo "3. Accédez à l'application sur http://localhost:3000"
echo ""
echo "📚 Documentation :"
echo "   - Guide rapide : QUICKSTART.md"
echo "   - Documentation complète : README.md"
echo "   - Architecture : ARCHITECTURE.md"
echo ""
echo "🎉 Bon développement !"
