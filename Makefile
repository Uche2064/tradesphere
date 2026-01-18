.PHONY: help install dev build start stop restart logs clean migrate seed reset

# Variables
COMPOSE=docker-compose
APP_SERVICE=app
DB_SERVICE=postgres

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Installe les dépendances
	npm install

dev: ## Lance l'application en mode développement
	npm run dev

build: ## Build l'application avec Docker
	$(COMPOSE) build

up: ## Démarre tous les services
	$(COMPOSE) up -d

down: ## Arrête tous les services
	$(COMPOSE) down

restart: ## Redémarre tous les services
	$(COMPOSE) restart

logs: ## Affiche les logs
	$(COMPOSE) logs -f

logs-app: ## Affiche les logs de l'application
	$(COMPOSE) logs -f $(APP_SERVICE)

logs-db: ## Affiche les logs de la base de données
	$(COMPOSE) logs -f $(DB_SERVICE)

clean: ## Nettoie les volumes et conteneurs
	$(COMPOSE) down -v

ps: ## Liste les conteneurs en cours d'exécution
	$(COMPOSE) ps

migrate: ## Exécute les migrations Prisma
	npx prisma migrate dev

migrate-deploy: ## Déploie les migrations en production
	npx prisma migrate deploy

generate: ## Génère le client Prisma
	npx prisma generate

seed: ## Remplit la base avec des données de test
	npm run seed

studio: ## Ouvre Prisma Studio
	npx prisma studio

reset: ## Reset complet de la base de données
	npx prisma migrate reset --force

docker-migrate: ## Exécute les migrations dans Docker
	$(COMPOSE) exec $(APP_SERVICE) npx prisma migrate deploy

docker-seed: ## Remplit la base dans Docker
	$(COMPOSE) exec $(APP_SERVICE) npm run seed

docker-shell: ## Ouvre un shell dans le conteneur app
	$(COMPOSE) exec $(APP_SERVICE) /bin/sh

docker-db-shell: ## Ouvre un shell PostgreSQL
	$(COMPOSE) exec $(DB_SERVICE) psql -U tradesphere -d tradesphere

full-start: build up migrate seed ## Démarre complètement l'application (build + up + migrate + seed)
