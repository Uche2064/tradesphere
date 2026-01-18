#  TradeSphere - Plateforme SaaS Multi-Tenant de Gestion Commerciale

## 📋 Table des matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Sécurité](#sécurité)
- [Tests](#tests)
- [Déploiement](#déploiement)

---

## 📖 À propos

**TradeSphere** est une plateforme SaaS moderne de gestion commerciale multi-tenant conçue pour les entreprises de vente au détail et de commerce. Elle offre une gestion complète des stocks, des ventes, des utilisateurs et des statistiques en temps réel.

### Caractéristiques principales

-  **Multi-Tenant** : Isolation complète des données par commerce
- 🔐 **Authentification 2FA** : TOTP, Email, SMS (OBLIGATOIRE pour SuperAdmin et Directeurs)
- 👥 **RBAC Avancé** : 5 niveaux de rôles avec permissions granulaires
- 📊 **Temps Réel** : WebSocket pour les mises à jour de stock et ventes
- 🔄 **Transactions Atomiques** : Gestion sécurisée des stocks
- 📈 **Statistiques** : Dashboards et rapports en temps réel
- 🐳 **Dockerisé** : Déploiement facile avec Docker Compose

---

## ⚡ Fonctionnalités

### Gestion des utilisateurs
- Système d'authentification JWT avec refresh tokens
- 2FA obligatoire (TOTP avec QR code, Email OTP)
- Gestion des rôles et permissions (RBAC)
- Audit logs de toutes les actions

### Multi-Tenant
- Isolation complète des données par tenant
- Abonnements (Trial, Active, Suspended, Cancelled)
- Gestion de multiples magasins par tenant
- Limites configurables (utilisateurs, magasins)

### Gestion des stocks
- Suivi en temps réel via WebSocket
- Transactions atomiques (évite les doubles ventes)
- Alertes de stock faible
- Historique complet des mouvements
- Ajustements d'inventaire

### Gestion des ventes
- Point de vente (POS) rapide
- Multiples méthodes de paiement
- Calcul automatique des taxes
- Rapports et statistiques
- Notifications en temps réel

### Dashboards
- SuperAdmin : Vue globale de tous les tenants
- Directeur : Statistiques de son commerce
- Gérant : Performance de son magasin
- Vendeur : Interface de caisse
- Magasinier : Gestion des stocks

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                  │
│  (React 19 + Zustand + TypeScript + Tailwind)      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ├─── REST API (Next.js API Routes)
                  │
                  ├─── WebSocket (Socket.io)
                  │
┌─────────────────┴───────────────────────────────────┐
│                Backend Services                      │
│  ├─ Auth Service (JWT + 2FA)                       │
│  ├─ Tenant Service (Multi-tenant Logic)            │
│  ├─ Stock Service (Atomic Transactions)            │
│  ├─ Sales Service                                   │
│  └─ Audit Service                                   │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───┴────┐   ┌───┴───┐   ┌────┴────┐
│PostgreSQL│  │ Redis │   │Socket.io│
│  (Data)  │  │(Cache)│   │  (WS)   │
└──────────┘  └───────┘   └─────────┘
```

### Hiérarchie des rôles

1. **SUPERADMIN** 
   - Gestion globale de la plateforme
   - Création de tenants
   - Accès à toutes les données
   - 2FA OBLIGATOIRE

2. **DIRECTEUR** 
   - Propriétaire d'un tenant
   - Gestion des utilisateurs
   - Gestion des magasins
   - Statistiques et rapports
   - 2FA OBLIGATOIRE

3. **GERANT** 🟡
   - Gestion d'un magasin
   - Gestion des stocks
   - Supervision des ventes

4. **VENDEUR** 
   - Interface de caisse (POS)
   - Création de ventes
   - Consultation des produits

5. **MAGASINIER** 🔵
   - Gestion des stocks
   - Ajustements d'inventaire
   - Réceptions de marchandises

---

## 🛠 Technologies

### Frontend
- **Next.js 16** - Framework React avec SSR
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Zustand** - Gestion d'état globale
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Composants UI
- **Socket.io Client** - WebSocket
- **Recharts** - Graphiques

### Backend
- **Next.js API Routes** - API REST
- **Prisma** - ORM
- **PostgreSQL** - Base de données
- **Redis** - Cache et sessions
- **Socket.io** - WebSocket server
- **JWT** - Authentification
- **Speakeasy** - 2FA TOTP
- **QRCode** - Génération QR codes
- **Nodemailer** - Envoi d'emails

### DevOps
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration
---

## Installation

### Prérequis

- **Node.js** >= 20.x
- **npm** >= 10.x
- **Docker** & **Docker Compose** (pour l'environnement complet)
- **PostgreSQL** 16+ (si pas Docker)
- **Redis** 7+ (si pas Docker)

### Installation locale (sans Docker)

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/tradesphere.git
cd tradesphere

# 2. Installer les dépendances
npm install

# 3. Copier les variables d'environnement
cp .env.example .env

# 4. Configurer la base de données dans .env
# DATABASE_URL="postgresql://user:password@localhost:5432/tradesphere?schema=public"

# 5. Générer le client Prisma
npx prisma generate

# 6. Exécuter les migrations
npx prisma migrate dev

# 7. Remplir la base avec des données de test
npm run seed

# 8. Lancer l'application en mode développement
npm run dev
```

L'application sera disponible sur **http://localhost:3000**

### Installation avec Docker (Recommandé)

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/tradesphere.git
cd tradesphere

# 2. Copier les variables d'environnement
cp .env.example .env

# Ou manuellement :
docker-compose build
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run seed
```

L'application sera disponible sur **http://localhost:3000**

---

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL="postgresql://tradesphere:password@localhost:5432/tradesphere?schema=public"

# JWT Secrets (CHANGEZ EN PRODUCTION!)
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-specific-password

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Redis
REDIS_URL=redis://localhost:6379

# 2FA
TWO_FACTOR_APP_NAME=TradeSphere
```

### Configuration de l'email Gmail

1. Activez la vérification en 2 étapes sur votre compte Gmail
2. Générez un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Utilisez ce mot de passe dans `GMAIL_PASSWORD`

---

## Migration de Base de Données

### Prérequis pour la Base de Données

Avant de commencer les migrations, assurez-vous d'avoir :

1. **PostgreSQL 16+** installé et en cours d'exécution
2. **Une base de données créée** :
   ```sql
   CREATE DATABASE tradesphere;
   ```
3. **Variables d'environnement configurées** dans `.env` :
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/tradesphere?schema=public"
   ```

### Étapes de Migration

#### 1. Installation des Dépendances
```bash
npm install
```

#### 2. Génération du Client Prisma
```bash
npx prisma generate
```

#### 3. Exécution des Migrations
```bash
# En développement (avec historique)
npx prisma migrate dev

# En production (sans historique)
npx prisma migrate deploy
```

#### 4. Vérification du Schéma
```bash
npx prisma db push --preview-feature
```

#### 5. Exploration de la Base de Données
```bash
npx prisma studio
```
Ouvre une interface web sur http://localhost:5555 pour explorer les données.

### Structure des Migrations

Les migrations sont stockées dans `prisma/migrations/` avec la nomenclature suivante :
- `20260116120006_init` : Migration initiale avec toutes les tables
- `20260116132931_changed_fields_type` : Modifications des types de champs
- `20260116133850_added_mustchangepasswordfield_to_user_table` : Ajout du champ mustChangePassword
- `20260116140018_added_email_to_2_fa_enum` : Ajout EMAIL à l'enum TwoFactorType
- `20260116204945_added_otp_model` : Ajout du modèle OTP
- `20260117071857_nullable_company_attribut_in_user_table` : Company nullable dans User
- `20260117073111_added_is_active_to_user_model` : Ajout isActive à User
- `20260117073238_added_email_verified_at_to_user_model` : Ajout emailVerifiedAt à User
- `20260118063031_add_unique_to_slug_in_company_and_role_tables` : Unicité des slugs

### Rollback des Migrations

```bash
# Annuler la dernière migration (développement uniquement)
npx prisma migrate reset

# Marquer une migration comme appliquée
npx prisma migrate resolve --applied 20260116120006_init
```

### Migration avec Docker

```bash
# Démarrer les services
docker-compose up -d

# Exécuter les migrations
docker-compose exec app npx prisma migrate deploy

# Ouvrir Prisma Studio
docker-compose exec app npx prisma studio
```

---

## 👥 Schéma des Rôles

### Architecture RBAC (Role-Based Access Control)

TradeSphere utilise un système de contrôle d'accès basé sur les rôles avec des permissions granulaires. Le système est organisé autour de :

- **5 Rôles prédéfinis** avec des niveaux hiérarchiques
- **Permissions basées sur les ressources** (tenants, users, stores, products, etc.)
- **Actions CRUD** (create, read, update, delete, list) plus des actions spécifiques
- **Isolation multi-tenant** complète

### Hiérarchie des Rôles

#### 1. SUPERADMIN  (Administrateur Système)
**Description :** Contrôle total de la plateforme
**2FA :** Obligatoire
**Permissions :**
-  **tenants** : read, list (lecture seule pour les tenants existants)
-  **users** : create, read, update, delete, list
-  **stores** : create, read, update, delete, list
-  **products** : create, read, update, delete, list
-  **categories** : create, read, update, delete, list
-  **stocks** : read, update, list, adjust
-  **sales** : create, read, list, refund
-  **statistics** : read, export
-  **audit** : read, list

#### 2. DIRECTEUR  (Propriétaire d'Entreprise)
**Description :** Gestion complète de son entreprise
**2FA :** Obligatoire
**Permissions :**
-  **tenants** : create (peut créer sa propre entreprise)
-  **users** : create, read, update, delete, list
-  **stores** : create, read, update, delete, list
-  **products** : create, read, update, delete, list
-  **categories** : create, read, update, delete, list
-  **stocks** : read, list, adjust
-  **sales** : read, list, refund
-  **statistics** : read, export
-  **audit** : read, list

#### 3. GERANT (Gestionnaire de Magasin)
**Description :** Gestion opérationnelle d'un magasin
**2FA :** Optionnel
**Permissions :**
-  **users** : read, list
-  **stores** : read
-  **products** : create, read, update, list
-  **categories** : read, list
-  **stocks** : read, list, adjust
-  **sales** : create, read, list, refund
-  **statistics** : read

#### 4. VENDEUR (Caissier)
**Description :** Interface de point de vente
**2FA :** Optionnel
**Permissions :**
-  **products** : read, list
-  **categories** : read, list
-  **stocks** : read, list
-  **sales** : create, read, list

#### 5. MAGASINIER (Gestionnaire de Stock)
**Description :** Gestion des inventaires
**2FA :** Optionnel
**Permissions :**
-  **products** : read, list
-  **categories** : read, list
-  **stocks** : read, update, list, adjust

### Structure des Permissions

#### Format des Permissions
Les permissions suivent le format : `resource:action`

Exemples :
- `users:create` - Créer un utilisateur
- `products:read` - Lire les produits
- `stocks:adjust` - Ajuster les stocks
- `sales:refund` - Rembourser une vente

#### Ressources Disponibles
- **tenants** : Gestion des entreprises
- **users** : Gestion des utilisateurs
- **stores** : Gestion des magasins
- **products** : Gestion des produits
- **categories** : Gestion des catégories
- **stocks** : Gestion des stocks
- **sales** : Gestion des ventes
- **statistics** : Accès aux statistiques
- **audit** : Logs d'audit

#### Actions Disponibles
- **create** : Créer
- **read** : Lire
- **update** : Modifier
- **delete** : Supprimer
- **list** : Lister
- **adjust** : Ajuster (spécifique aux stocks)
- **refund** : Rembourser (spécifique aux ventes)
- **export** : Exporter (spécifique aux statistiques)

### Isolation Multi-Tenant

Chaque rôle est automatiquement limité à son tenant :
- **SuperAdmin** : Accès à tous les tenants
- **Autres rôles** : Accès uniquement à leur propre tenant
- **Middleware automatique** : Vérification du tenant à chaque requête
- **Audit complet** : Traçabilité de toutes les actions

### Configuration des Rôles

Les rôles sont configurés via les seeders dans `lib/seeders/` :

#### rolesSeeder.ts
Définit les 5 rôles de base avec leurs descriptions.

#### permissionsSeeder.ts
- Définit toutes les permissions disponibles
- Configure les permissions par rôle
- Assigne les permissions aux rôles via RolePermission

#### adminSeeder.ts
Crée le compte SuperAdmin initial avec mot de passe temporaire.

### Modification des Permissions

Pour modifier les permissions d'un rôle :

1. **Éditer** `lib/seeders/permissionsSeeder.ts`
2. **Modifier** le tableau `ROLE_PERMISSIONS`
3. **Relancer** le seeder :
   ```bash
   npm run seed
   ```

### Vérification des Permissions

Les permissions sont vérifiées à chaque requête API via des middlewares :
- **auth.ts** : Vérification de l'authentification
- **rbac.ts** : Vérification des permissions
- **tenant.ts** : Isolation multi-tenant

---

##  Utilisation

### Comptes de test

Après le seed, vous disposez des comptes suivants :

#### SuperAdmin
```
Email: superadmin@tradesphere.com
Mot de passe: SuperAdmin@2024
```

#### Directeur Tech Store
```
Email: directeur@techstore.cm
Mot de passe: Directeur@2024
```

#### Directeur Fashion Boutique
```
Email: directeur@fashionboutique.sn
Mot de passe: Directeur@2024
```

#### Gérant
```
Email: gerant@techstore.cm
Mot de passe: Gerant@2024
```

#### Vendeur
```
Email: vendeur1@techstore.cm
Mot de passe: Vendeur@2024
```

#### Magasinier
```
Email: magasinier@techstore.cm
Mot de passe: Magasinier@2024
```

### Configuration de la 2FA

1. Connectez-vous avec un compte SuperAdmin ou Directeur
2. Allez dans **Paramètres** > **Sécurité**
3. Activez la 2FA :
   - **TOTP** : Scannez le QR code avec Google Authenticator ou Authy
   - **Email** : Recevez le code par email

---

## API Documentation

### Authentification

#### POST /api/auth/login
Connexion utilisateur

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "message": "Connexion réussie",
  "user": {...},
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

#### POST /api/auth/verify-2fa
Vérification du code 2FA

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

#### POST /api/auth/2fa/setup
Configuration de la 2FA

```json
{
  "type": "TOTP" // ou "EMAIL"
}
```

**Réponse (TOTP) :**
```json
{
  "type": "TOTP",
  "secret": "BASE32SECRET",
  "qrCode": "data:image/png;base64,..."
}
```

#### POST /api/auth/2fa/enable
Activer la 2FA

```json
{
  "code": "123456"
}
```

#### POST /api/auth/2fa/disable
Désactiver la 2FA

```json
{
  "password": "current-password",
  "code": "123456"
}
```

### Gestion des tenants (SuperAdmin uniquement)

#### GET /api/tenants
Liste tous les tenants

#### POST /api/tenants
Créer un nouveau tenant

```json
{
  "slug": "mon-commerce",
  "companyName": "Mon Commerce SARL",
  "businessType": "Retail",
  "country": "Cameroun",
  "maxUsers": 10,
  "maxStores": 3
}
```

### Gestion des stocks

#### PUT /api/stocks/:id
Mettre à jour le stock

```json
{
  "quantity": 10,
  "type": "IN", // ou "OUT"
  "reason": "purchase", // "sale", "adjustment", "return"
  "notes": "Réception fournisseur"
}
```

### WebSocket Events

#### Connexion
```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  path: "/api/socket",
  auth: {
    token: "YOUR_JWT_TOKEN"
  }
});
```

#### Événements disponibles

```javascript
// Mise à jour de stock
socket.on("stock:update", (data) => {
  console.log("Stock updated:", data);
});

// Alerte stock faible
socket.on("stock:low", (data) => {
  console.log("Low stock alert:", data);
});

// Vente complétée
socket.on("sale:completed", (data) => {
  console.log("Sale completed:", data);
});
```

---

## Sécurité

### Mesures implémentées

1. **Authentification JWT**
   - Access tokens courts (15 min)
   - Refresh tokens longs (7 jours)
   - Rotation des refresh tokens

2. **2FA Obligatoire**
   - SuperAdmin : OBLIGATOIRE
   - Directeur : OBLIGATOIRE
   - Autres rôles : Optionnel

3. **RBAC (Role-Based Access Control)**
   - Permissions granulaires
   - Vérification à chaque requête
   - Isolation multi-tenant

4. **Isolation des données**
   - Middleware de tenant
   - Vérification systématique du tenant ID
   - SuperAdmin seul peut accéder à tous les tenants

5. **Transactions atomiques**
   - Prisma transactions pour les stocks
   - Évite les conditions de course
   - Rollback automatique en cas d'erreur

6. **Audit Logs**
   - Traçabilité complète
   - IP et User-Agent enregistrés
   - Conservation configurable


## 📈 Déploiement

### Production avec Docker

1. Configurez vos variables d'environnement de production
2. Buildez l'image :
```bash
docker-compose -f docker-compose.prod.yml build
```

3. Démarrez les services :
```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. Exécutez les migrations :
```bash
docker-compose exec app npx prisma migrate deploy
```

### Variables d'environnement production

Assurez-vous de changer :
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `DATABASE_URL`
- `REDIS_URL`
- `NEXT_PUBLIC_APP_URL`

---

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE)

---

## 👨‍💻 Contributeurs

- Votre Nom - [GitHub](https://github.com/votre-username)

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@tradesphere.com
- 🐛 Issues : [GitHub Issues](https://github.com/votre-username/tradesphere/issues)

---

**Fait avec ❤️ par l'équipe TradeSphere**
