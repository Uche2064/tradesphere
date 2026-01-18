import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
    pool: Pool
}

// Ajouter les timeouts PostgreSQL dans la connection string si pas déjà présents
let databaseUrl = process.env.DATABASE_URL || '';
if (databaseUrl && !databaseUrl.includes('statement_timeout')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  // Ajouter le paramètre de timeout PostgreSQL
  // statement_timeout en millisecondes (30000ms = 30 secondes)
  databaseUrl += `${separator}statement_timeout=30000`;
}

// Configuration du pool de connexions PostgreSQL avec timeout
// Réduire le nombre de connexions pour éviter les erreurs sur Neon/serverless
const pool = globalForPrisma.pool || new Pool({
  connectionString: databaseUrl,
  max: 10, // Réduire à 10 pour éviter les limites sur Neon/serverless
  min: 1, // Réduire à 1 pour éviter trop de connexions
  idleTimeoutMillis: 20000, // Fermer les connexions idle après 20s
  connectionTimeoutMillis: 10000, // Timeout de connexion de 10s (10 secondes)
  // Garder les connexions actives plus longtemps
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool
}

// Gérer les erreurs du pool avec reconnexion automatique
pool.on('error', (err) => {
  // Ne pas logger les erreurs de connexion terminée si le pool se reconnecte automatiquement
  if (err.message.includes('Connection terminated') || err.message.includes('Connection ended')) {
    // Ces erreurs sont normales quand les connexions sont récupérées par le pool
    return;
  }
  console.error('Erreur inattendue sur le client PostgreSQL du pool:', err)
})

const adapter = new PrismaPg(pool)

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
