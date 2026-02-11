# ECO IMPACT TRACKER - Backend

## Description

Backend API pour ECO Impact Tracker - Application de suivi d'impact carbone personnel.

## Stack Technique

- **Java 17**
- **Spring Boot 3.2.1**
- **PostgreSQL**
- **Spring Security + JWT**
- **Swagger/OpenAPI**
- **Maven**

## Architecture

```
src/main/java/com/ecoimpact/tracker/
├── config/          # Configuration (Security, OpenAPI)
├── controller/      # REST Controllers
├── domain/          # Entités JPA
├── dto/             # Data Transfer Objects
├── repository/      # Spring Data Repositories
├── security/        # JWT, UserDetailsService, Filters
└── service/         # Business Logic
```

## Prérequis

### 1. Installation de Java 17

**macOS:**
```bash
brew install openjdk@17
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install openjdk-17-jdk
```

### 2. Installation de PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 3. Configuration de la base de données

```bash
# Se connecter à PostgreSQL
psql postgres

# Créer la base de données
CREATE DATABASE eco_tracker;

# Créer un utilisateur (optionnel)
CREATE USER eco_user WITH PASSWORD 'eco_password';
GRANT ALL PRIVILEGES ON DATABASE eco_tracker TO eco_user;

# Quitter
\q
```

### 4. Installation de Maven

**macOS:**
```bash
brew install maven
```

**Linux:**
```bash
sudo apt-get install maven
```

## Configuration

Le fichier `src/main/resources/application.yml` contient la configuration par défaut :

- **Base de données:** `jdbc:postgresql://localhost:5432/eco_tracker`
- **User:** `postgres`
- **Password:** `postgres`
- **Port:** `8080`

📝 **Modifier ces valeurs selon votre configuration locale.**

## Démarrage de l'application

### Option 1: Avec Maven installé

```bash
# Compiler le projet
mvn clean install

# Lancer l'application
mvn spring-boot:run
```

### Option 2: Avec le JAR généré

```bash
# Compiler et générer le JAR
mvn clean package -DskipTests

# Exécuter le JAR
java -jar target/eco-impact-tracker-1.0.0.jar
```

### Option 3: Via votre IDE

- Ouvrir le projet dans IntelliJ IDEA / Eclipse / VS Code
- Exécuter la classe `EcoImpactTrackerApplication.java`

## Accès à Swagger UI

Une fois l'application démarrée :

🔗 **Swagger UI:** http://localhost:8080/swagger-ui.html

🔗 **API Docs JSON:** http://localhost:8080/v3/api-docs

## Utilisation de l'API

### 1. Inscription d'un utilisateur

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Réponse:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john@example.com",
  "name": "John Doe",
  "userId": 1
}
```

### 2. Connexion

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Utiliser le token JWT

Pour toutes les requêtes protégées, ajouter le header:

```bash
Authorization: Bearer <votre_token>
```

**Exemple:**
```bash
curl -X GET http://localhost:8080/entries \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Endpoints Disponibles

### Authentification (Public)
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion

### Activity Types (Protégé)
- `POST /activity-types` - Créer un type d'activité
- `GET /activity-types` - Lister tous les types
- `GET /activity-types/{id}` - Obtenir un type par ID
- `PUT /activity-types/{id}` - Modifier un type
- `DELETE /activity-types/{id}` - Supprimer un type

### Activity Templates (Protégé)
- `POST /activity-templates` - Créer un template
- `GET /activity-templates` - Lister tous les templates
- `GET /activity-templates/{id}` - Obtenir un template par ID
- `GET /activity-templates/by-type/{activityTypeId}` - Templates par type
- `PUT /activity-templates/{id}` - Modifier un template
- `DELETE /activity-templates/{id}` - Supprimer un template

### Entries (Protégé)
- `POST /entries` - Créer une entrée
- `GET /entries` - Lister toutes les entrées de l'utilisateur
- `GET /entries/{id}` - Obtenir une entrée par ID
- `GET /entries/range?from=YYYY-MM-DD&to=YYYY-MM-DD` - Entrées par période
- `PUT /entries/{id}` - Modifier une entrée
- `DELETE /entries/{id}` - Supprimer une entrée

### Goals (Protégé)
- `POST /goals` - Créer un objectif
- `GET /goals` - Lister tous les objectifs
- `GET /goals/{id}` - Obtenir un objectif par ID
- `PUT /goals/{id}` - Modifier un objectif
- `DELETE /goals/{id}` - Supprimer un objectif

### Reports (Protégé)
- `POST /reports` - Générer un rapport
- `GET /reports` - Lister tous les rapports
- `GET /reports/{id}` - Obtenir un rapport par ID
- `DELETE /reports/{id}` - Supprimer un rapport

### Statistics (Protégé)
- `GET /stats/summary?from=YYYY-MM-DD&to=YYYY-MM-DD` - Résumé CO₂
- `GET /stats/by-day?from=YYYY-MM-DD&to=YYYY-MM-DD` - CO₂ par jour
- `GET /stats/by-type?from=YYYY-MM-DD&to=YYYY-MM-DD` - CO₂ par type

## Modèle de Données

### Entités
- **AppUser** - Utilisateurs
- **ActivityType** - Types d'activité (transport, alimentation, énergie)
- **ActivityTemplate** - Templates avec facteurs CO₂
- **Entry** - Entrées d'activités utilisateur
- **Goal** - Objectifs CO₂
- **Report** - Rapports générés

### Relations
- `AppUser` → `Entry` (OneToMany)
- `AppUser` → `Goal` (OneToMany)
- `AppUser` → `Report` (OneToMany)
- `ActivityType` → `ActivityTemplate` (OneToMany)
- `ActivityTemplate` → `Entry` (OneToMany)

## Sécurité

- **JWT Authentication** - Token valide 24h
- **Routes publiques:** `/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`
- **Routes protégées:** Toutes les autres routes nécessitent un JWT valide
- **Isolation des données:** Un utilisateur ne peut accéder qu'à SES propres données

## Tests via Swagger

1. Aller sur http://localhost:8080/swagger-ui.html
2. Tester `/auth/register` pour créer un compte
3. Copier le `token` de la réponse
4. Cliquer sur le bouton **"Authorize"** en haut à droite
5. Entrer: `Bearer <votre_token>`
6. Tester tous les autres endpoints

## Troubleshooting

### Erreur de connexion PostgreSQL
```
Vérifier que PostgreSQL est démarré:
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

### Port 8080 déjà utilisé
```yaml
# Changer le port dans application.yml
server:
  port: 8081
```

### Erreur JWT
```
Vérifier que le header Authorization est bien formaté:
Authorization: Bearer <token>
```

## Améliorations Futures

- [ ] Pagination pour les listes
- [ ] Validation avancée des données
- [ ] Cache pour les statistiques
- [ ] Export des rapports (PDF, CSV)
- [ ] Notifications par email
- [ ] Dashboard admin

## Auteur

ECO Impact Tracker Team

## Licence

MIT License
