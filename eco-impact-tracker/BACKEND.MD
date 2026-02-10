# Rapport Backend – ECO Impact Tracker

## Introduction

Dans le cadre du cours d'Architectures Web, l'objectif étais de concevoir un backend complet et fonctionel pour une application de suivi d'impact carbone (CO₂). Le backend devait répondre à plusieur contraintes pédagogiques : Java, API REST, Swagger, base de données relationnelle et sécurité, tout en restant cohérent avec un cas d'usage réel.

Il est important de préciser que **l'intelligence artificielle a été un outil central** dans la réalisation de ce projet. J'ai utilisé principalement **ChatGPT** pour raisonner et structurer mes idées, et **Antigravity** (un IDE avec agent IA intégré) pour accélérer l'écriture du code et le débogage.

Cependant, l'IA n'a jamais été utilisé comme une "boîte magique". J'ai adopté une posture de **chef d'orchestre technique** :
- je définissais les objectifs et le périmètre
- j'analysais les problèmes rencontrés
- je formulais des prompts précis basé sur mes observations
- j'interprétais et vérifiais les réponses
- je testais réelement le système (Swagger, navigateur, logs)
- et j'itérais jusqu'à obtenir un résultat fonctionnel que je comprenais

Ce document raconte le déroulé du projet en montrant les prompts utilisés, les problèmes rencontrés et la compréhension technique acquise au fur et à mesure.

---

## 1. Choix technologiques

### 1.1 Spring Boot (Java 17)

Le backend est développé en **Java 17** avec **Spring Boot 3.2.1**. Ce choix s'est imposé car :
- C'est le framework le plus utilisé en entreprise pour le backend Java
- Il permet de créer des API REST rapidement grâce aux annotations (`@RestController`, `@GetMapping`, etc.)
- L'intégration avec Spring Security pour l'authentification est native
- La compatibilité avec JPA / Hibernate simplifie l'accès aux données
- Swagger (Springdoc OpenAPI) permet de documenter et tester l'API directement

Spring Boot permet de se concentrer sur la logique métier sans se soucier de la config serveur (Tomcat est embarqué).

### 1.2 Maven

Le projet utilise **Maven** pour la gestion des dépendances et le build. Toutes les dépendences sont centralisées dans le `pom.xml` :
- `spring-boot-starter-web` → API REST
- `spring-boot-starter-data-jpa` → ORM/Hibernate
- `spring-boot-starter-security` → sécurité
- `spring-boot-starter-validation` → validation des DTOs
- `jjwt-api` (0.12.3) → génération et vérification des tokens JWT
- `springdoc-openapi-starter-webmvc-ui` (2.3.0) → Swagger UI
- `lombok` → réduction du code boilerplate (getters, setters, constructeurs)

Maven m'a aussi permis de comprendre et résoudre des problèmes de compatibilité entre versions (par ex. Java 25 installé sur ma machine alors que le projet cible Java 17).

### 1.3 PostgreSQL

La base de données est **PostgreSQL**, choisie pour sa robustesse et son utilisation courante en production. Elle stocke :
- les utilisateurs (`app_users`)
- les types d'activités (`activity_types`)
- les modèles CO₂ / catalogue (`activity_templates`)
- les entrées utilisateur (`entries`)
- les objectifs (`goals`)
- les rapports (`reports`)

L'utilisation de **JPA / Hibernate** avec `ddl-auto: update` permet de générer et mettre à jour les tables automatiquement au démarrage. En production on utiliserait plutôt un outil de migration comme Flyway, mais pour le dev c'est très pratique.

---

## 2. Architecture du projet

### 2.1 Organisation en couches

Le projet suit une architecture en couches classique Spring :

```
src/main/java/com/ecoimpact/tracker/
├── config/           → Configuration (sécurité, CORS, seeding)
├── controller/       → Endpoints REST (réception des requêtes)
├── service/          → Logique métier
├── repository/       → Accès base de données (JPA)
├── domain/           → Entités JPA (tables)
├── dto/              → Objets de transfert (requêtes/réponses)
└── security/         → JWT et filtres d'authentification
```

Chaque couche a un rôle bien défini :
- Le **Controller** reçoit la requête HTTP, valide les paramètres et délègue au service
- Le **Service** contient la logique métier (calculs CO₂, vérifications)
- Le **Repository** fait les requêtes en base via JPA
- Les **DTOs** permettent de ne pas exposer directement les entités dans l'API

### 2.2 Fichiers principaux

Voici les fichiers clés du backend et leur rôle :

**Controllers (7)** : `AuthController`, `EntryController`, `ActivityTypeController`, `ActivityTemplateController`, `GoalController`, `StatsController`, `ReportController`

**Services (7)** : chacun correspond à un controller (logique métier séparée)

**Repositories (6)** : `AppUserRepository`, `EntryRepository`, `ActivityTypeRepository`, `ActivityTemplateRepository`, `GoalRepository`, `ReportRepository`

**Entités (7)** : `AppUser`, `Entry`, `ActivityType`, `ActivityTemplate`, `Goal`, `GoalPeriod` (enum), `Report`

**Config (6)** : `SecurityConfig`, `CorsConfig`, `OpenApiConfig`, `DataSeeder`, `TestUserSeeder`, `RequestLoggingFilter`

**Sécurité (3)** : `JwtUtil`, `JwtRequestFilter`, `CustomUserDetailsService`

---

## 3. Modélisation des données

### 3.1 Entités et relations

Le modèle de données repose sur 5 entités principales :

- **AppUser** : l'utilisateur (email, nom, mot de passe hashé avec BCrypt)
- **ActivityType** : catégorie d'activité (Transport, Alimentation, Énergie, Achats)
- **ActivityTemplate** : modèle d'activité avec facteur d'émission CO₂ (ex: "Voiture essence" → 0.192 kg CO₂/km)
- **Entry** : activité réelement effectuée par l'utilisateur (quantité + date + template)
- **Goal** : objectif de réduction CO₂ (par jour, semaine ou mois)

Les relations sont les suivantes :
- Un **User** possède plusieurs **Entry**, **Goal** et **Report** (OneToMany)
- Chaque **Entry** référence un **ActivityTemplate** (ManyToOne, EAGER)
- Chaque **ActivityTemplate** appartient à un **ActivityType** (ManyToOne)

### 3.2 Calcul des émissions

Le calcul CO₂ est simple mais central : `émission = quantité × co2Factor`

Par exemple : 50 km en voiture × 0.192 kg/km = 9.6 kg CO₂

Ce calcul est fait dans le `StatsService` qui agrège les données par jour et par type d'activité. La requête dans le repository charge les entrées avec leur template :

```java
@Query("SELECT e FROM Entry e WHERE e.user.id = :userId
       AND e.date BETWEEN :startDate AND :endDate")
List<Entry> findEntriesForStats(...)
```

Le template est chargé automatiquement grâce au `FetchType.EAGER` configuré sur l'entité `Entry`.

### 3.3 Catalogue CO₂ (DataSeeder)

Au démarrage, le `DataSeeder` (qui implémente `CommandLineRunner`) charge un fichier `catalog-seed.json` contenant les facteurs d'émissions basés sur les données ADEME. Le seeder :
- Vérifie si la base contient déja des données (pour ne pas dupliquer)
- Permet un reset forcé avec la variable `SEED_FORCE=true`
- Insère les `ActivityType` puis les `ActivityTemplate` associés

Il y a aussi un `TestUserSeeder` (annoté `@Order(10)` pour s'exécuter après le DataSeeder) qui crée un utilisateur de test (`test@gmail.com` / `test`) avec des entrées et objectifs réalistes pour pouvoir tester le dashboard directement.

---

## 4. Sécurité et authentification

### 4.1 JWT (JSON Web Token)

L'authentification est **stateless** : pas de session côté serveur. Le flux est le suivant :
1. L'utilisateur envoie ses credentials via `POST /auth/login`
2. Le backend vérifie le mot de passe (hashé avec BCrypt) via `AuthenticationManager`
3. Si valide, un token JWT est généré avec `JwtUtil` (durée : 24h)
4. Le frontend stocke le token et l'envoie dans chaque requête (`Authorization: Bearer <token>`)
5. Le `JwtRequestFilter` intercepte chaque requête, extrait le token, le vérifie et injecte l'utilisateur dans le `SecurityContext`

Voici le code réel de génération du token :
```java
public String generateToken(String username) {
    Map<String, Object> claims = new HashMap<>();
    return createToken(claims, username);
}

private String createToken(Map<String, Object> claims, String subject) {
    return Jwts.builder()
            .claims(claims)
            .subject(subject)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey())
            .compact();
}
```

### 4.2 Configuration Spring Security

Dans `SecurityConfig.java`, les routes publiques et protégées sont définies :

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/auth/**").permitAll()
    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**",
                     "/swagger-ui.html", "/api-docs/**").permitAll()
    .anyRequest().authenticated())
```

En gros : `/auth` et Swagger sont publics, tout le reste nécéssite un token valide.

Le CSRF est désactivé car on utilise du JWT (pas de cookies de session) :
```java
http.csrf(AbstractHttpConfigurer::disable)
```

---

## 5. API REST – Endpoints

L'API expose un CRUD complet pour chaque ressource. Voici un résumé :

| Resource | Endpoints | Méthodes |
|----------|-----------|----------|
| Auth | `/auth/register`, `/auth/login` | POST |
| Entries | `/entries`, `/entries/{id}`, `/entries/range` | GET, POST, PUT, DELETE |
| Activity Types | `/activity-types`, `/activity-types/{id}` | GET, POST, PUT, DELETE |
| Activity Templates | `/activity-templates`, `/activity-templates/{id}`, `/activity-templates/by-type/{id}` | GET, POST, PUT, DELETE |
| Goals | `/goals`, `/goals/{id}` | GET, POST, PUT, DELETE |
| Reports | `/reports`, `/reports/{id}` | GET, POST, DELETE |
| Stats | `/stats/summary`, `/stats/by-day`, `/stats/by-type` | GET |

Les endpoints Stats prennent des paramètres `?from=YYYY-MM-DD&to=YYYY-MM-DD` pour filtrer par période.

Tout est documenté automatiquement via **Swagger UI** accessible sur `http://localhost:8081/swagger-ui/index.html`.

---

## 6. Utilisation de l'IA – Démarche et exemples de prompts

### 6.1 Mon approche

Je n'ai **jamais** utilisé l'IA avec des prompts vagues du type "fais-moi un backend". Chaque interaction etais précédée :
- d'une observation réelle (un bug, un besoin, un message d'erreur)
- d'une analyse personnelle du problème
- d'un prompt précis qui explique le contexte

Après chaque réponse de l'IA, je vérifiais le résultat dans le code, je testais via Swagger ou le navigateur, et je corrigeais si necessaire.

### 6.2 Exemples concrets de prompts

**Prompt 1 – Architecture initiale**

> « Je dois créer un backend Java pour une application de suivi de CO₂. Il me faut une API REST, PostgreSQL, Swagger et une authentification sécurisée. Propose-moi une architecture claire et explique chaque couche. »

→ Ça m'a permis de comprendre la séparation Controller / Service / Repository et pourquoi on utilise des DTOs plutôt que d'exposer les entités directement.

**Prompt 2 – Initialisation du projet**

> « Guide-moi pour initialiser un projet Spring Boot avec Maven, Java 17, JPA, PostgreSQL, Spring Security et Swagger. Explique le rôle de chaque dépendance dans le pom.xml. »

→ J'ai appris à lire un `pom.xml` et à comprendre ce que chaque `starter` apporte.

**Prompt 3 – Modélisation des données**

> « Je pense séparer les catégories d'activités (ActivityType), les templates CO₂ (ActivityTemplate) et les entrées utilisateurs (Entry). Est-ce une bonne modélisation ? Quelles relations JPA utiliser ? »

→ J'ai compris la différence entre données de référence (catalogue) et données utilisateur, et quand utiliser `@ManyToOne` avec `FetchType.EAGER` vs `LAZY`.

**Prompt 4 – Seeding du catalogue**

> « Je veux injecter un catalogue CO₂ réaliste basé sur les données ADEME au démarrage de l'application, sans dupliquer les données si l'app redémarre. Comment faire proprement avec Spring Boot ? »

→ J'ai compris le concept de `CommandLineRunner` et la logique conditionnelle du `DataSeeder` (vérifier si les données existent déja avant d'insérer).

**Prompt 5 – Débogage CORS**

> « Mon frontend React (port 5173) n'arrive pas à appeler le backend (port 8081). J'ai une erreur CORS dans la console. Comment configurer Spring pour accepter les requêtes cross-origin ? »

→ J'ai créé le `CorsConfig.java` avec les origines autorisées (`localhost:5173`, `localhost:3000`), les méthodes HTTP et les headers nécessaires (notament `Authorization` pour le JWT).

**Prompt 6 – Erreur 403 sur toutes les requêtes**

> « Toutes mes requêtes POST retournent 403 même avec un token valide. Je pense que c'est lié au CSRF. Comment le désactiver proprement avec Spring Security ? »

→ Le problème venait effectivement du CSRF activé par défaut, qui bloque les requêtes POST/PUT/DELETE dans une API stateless. La solution : `http.csrf(AbstractHttpConfigurer::disable)`.

**Prompt 7 – Page blanche sur le frontend**

> « Le backend démarre correctement mais le frontend affiche une page blanche. J'ai vérifié que le backend répond sur Swagger. Le problème vient peut-être d'un mismatch dans les DTOs ou un import incorrect côté React. »

→ Le problème venait d'imports de types incorrects côté frontend (import de types comme des valeurs). J'ai appris à distinguer `import type { X }` de `import { X }` en TypeScript.

**Prompt 8 – Statistiques et graphiques vides**

> « Le dashboard s'affiche mais les graphiques sont vides. Je pense que c'est parce que je n'ai pas de données pour l'utilisateur connecté. Comment générer des données de test réalistes ? »

→ C'est ce qui m'a ammené à créer le `TestUserSeeder` qui génère automatiquement des entrées et objectifs réalistes pour un utilisateur de test.

**Prompt 9 – Logs illisibles**

> « Les logs Spring Boot sont trop verbeux, je vois des dizaines de lignes Hibernate à chaque requête. Comment réduire le bruit pour ne garder que les informations utiles ? »

→ J'ai configuré les niveaux de log dans `application.yml` : `org.hibernate.SQL: OFF`, `org.springframework: WARN`, et `com.ecoimpact.tracker: INFO`. J'ai aussi créé un `RequestLoggingFilter` qui affiche chaque requête HTTP de manière claire : `POST /entries -> 201 (34ms)`.

---

## 7. Problèmes rencontrés et résolutions

| Problème | Cause | Solution |
|----------|-------|----------|
| Port 8080 déja utilisé | Processus existant | Changé le port à `8081` dans `application.yml` |
| Erreurs CORS | Frontend et backend sur des ports différents | `CorsConfig.java` avec origines explicites |
| 403 Forbidden sur POST | CSRF activé par défaut | `http.csrf(AbstractHttpConfigurer::disable)` |
| Page blanche frontend | Imports TypeScript incorrects | Fix des `import type` côté React |
| Sérialisation infinie JSON | Relations bidirectionnelles JPA | `@JsonIgnore` sur le côté inverse (`user` dans `Entry`) |
| Token expiré sans message | Frontend ne gérait pas le 401 | Interceptor Axios pour détecter le 401 et rediriger vers `/login` |
| Lombok non reconnu | Annotation processor manquant | Config `maven-compiler-plugin` avec `annotationProcessorPaths` |
| Données vides au dashboard | Pas d'entrées pour le user connecté | Création du `TestUserSeeder` |

Chaque problème a été résolu par le même processus : **observer l'erreur → analyser → formuler un prompt précis → vérifier la solution → tester**.

---

## 8. Ce que j'ai appris

Ce projet m'a permis de comprendre concrétement :
- Comment fonctionne une **architecture backend en couches** (et pourquoi c'est important)
- Le fonctionnement de **JWT** et Spring Security (token, filtre, SecurityContext)
- Comment **JPA/Hibernate** fait le pont entre le code Java et la base PostgreSQL
- La différence entre `EAGER` et `LAZY` loading (et pourquoi ça compte pour les perfs)
- Comment lire et interpréter les **logs Spring Boot** pour déboguer
- L'importance des **DTOs** pour ne pas exposer la structure interne
- Comment utiliser **Swagger** pour tester et documenter une API
- Et surtout, comment **piloter un projet avec l'IA** : formuler des prompts precise, vérifier les résultats, et itérer

---

## Conclusion

Ce backend est le résultat d'une démarche structurée ou j'ai piloté chaque décision technique, même quand l'IA m'aidait à avancer plus vite.

L'IA a été un **accélérateur**, pas un remplaçant :
- c'est moi qui ais défini l'architecture
- c'est moi qui ais identifié et diagnostiqué les bugs
- c'est moi qui ais testé chaque fonctionnalité sur Swagger et dans le navigateur
- c'est moi qui ais validé que tout fonctionnait de bout en bout

Le projet final est une application fonctionelle avec une API REST complète, une authentification JWT, un catalogue CO₂ réaliste, des statistiques agrégées et un dashboard frontend qui affiche de vraies données.

---

*Projet réalisé dans le cadre du cours d'Architectures Web — Février 2026*