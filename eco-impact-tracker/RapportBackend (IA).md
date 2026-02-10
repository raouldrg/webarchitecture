# Rapport Technique Backend — ECO Impact Tracker

---

## 1. Introduction

### 1.1. Présentation du projet

**ECO Impact Tracker** est une application web full-stack permettant aux utilisateurs de suivre et analyser leur empreinte carbone quotidienne. Le backend constitue le cœur fonctionnel de cette application, gérant l'ensemble de la logique métier, la persistance des données et la sécurité.

### 1.2. Rôle du backend

Le backend Spring Boot assume plusieurs responsabilités critiques :

- **Gestion de l'authentification** : inscription, connexion et validation des tokens JWT
- **Stockage et manipulation des données** : persistance PostgreSQL via JPA/Hibernate
- **Calcul des émissions CO₂** : agrégation et statistiques par période, jour et type d'activité
- **Exposition d'une API REST** : interface standardisée pour le frontend React
- **Catalogue de facteurs d'émission** : base de données pré-remplie avec les facteurs CO₂ officiels (ADEME)

### 1.3. Objectifs fonctionnels

| Fonctionnalité | Description |
|----------------|-------------|
| **Authentification** | Inscription/connexion sécurisée avec JWT |
| **Gestion des activités** | CRUD complet sur les types d'activités et modèles |
| **Saisie des entrées** | Enregistrement des activités quotidiennes de l'utilisateur |
| **Objectifs CO₂** | Définition d'objectifs de réduction par période |
| **Tableau de bord** | Statistiques agrégées et visualisations |
| **Rapports** | Génération de synthèses périodiques |

---

## 2. Choix technologiques

### 2.1. Java 17

**Ce que c'est :**
Java 17 est une version LTS (Long Term Support) du langage Java, publiée en septembre 2021.

**Pourquoi ce choix :**
- **Stabilité LTS** : support garanti pendant plusieurs années, idéal pour un projet universitaire et professionnel
- **Compatibilité Spring Boot 3.x** : Spring Boot 3.x requiert Java 17 minimum
- **Nouvelles fonctionnalités** : records, sealed classes, pattern matching amélioré
- **Performance** : améliorations du garbage collector et optimisations JVM

**Alternatives non retenues :**
- *Java 21* : trop récent, moins de documentation et de compatibilité avec certaines bibliothèques
- *Java 11* : incompatible avec Spring Boot 3.x qui impose Java 17+

---

### 2.2. Spring Boot 3.2.1

**Ce que c'est :**
Spring Boot est un framework Java qui simplifie la création d'applications Spring autonomes, configurées par convention.

**Pourquoi ce choix :**
- **Auto-configuration** : configuration minimale requise, détection automatique des dépendances
- **Écosystème complet** : Spring Web, Security, Data JPA intégrés de manière cohérente
- **Serveur embarqué** : Tomcat intégré, pas de déploiement WAR nécessaire
- **Production-ready** : actuators, health checks, métriques inclus
- **Standard industriel** : framework le plus utilisé en entreprise pour le backend Java

**Alternatives non retenues :**
- *Quarkus* : plus performant mais écosystème moins mature
- *Micronaut* : moins de documentation et communauté plus petite
- *Jakarta EE pur* : configuration trop verbeuse pour un projet pédagogique

---

### 2.3. Spring Web (MVC)

**Ce que c'est :**
Module Spring pour créer des API REST avec le pattern Model-View-Controller.

**Pourquoi ce choix :**
- **Annotations simples** : `@RestController`, `@GetMapping`, `@PostMapping` rendent le code lisible
- **Sérialisation automatique** : conversion JSON/Java transparente via Jackson
- **Validation intégrée** : annotations JSR-380 (`@Valid`, `@NotBlank`, `@Email`)
- **Gestion des erreurs** : `@ExceptionHandler` pour les réponses d'erreur cohérentes

---

### 2.4. Spring Data JPA

**Ce que c'est :**
Abstraction de la couche d'accès aux données, utilisant Hibernate comme implémentation ORM.

**Pourquoi ce choix :**
- **Réduction du code boilerplate** : interfaces étendant `JpaRepository` suffisent pour les opérations CRUD
- **Requêtes dérivées** : méthodes comme `findByEmail()` automatiquement implémentées
- **Requêtes personnalisées** : annotation `@Query` pour les cas complexes
- **Gestion des transactions** : `@Transactional` simplifie la cohérence des données

**Exemple du projet :**
```java
public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

---

### 2.5. Spring Security + JWT

**Ce que c'est :**
Spring Security est le framework de sécurité de Spring. JWT (JSON Web Token) est un standard de tokens d'authentification stateless.

**Pourquoi ce choix :**
- **API stateless** : pas de session serveur, chaque requête contient son token
- **Scalabilité** : plusieurs instances backend sans partage de session
- **Standard ouvert** : interopérabilité avec n'importe quel frontend
- **Contrôle fin** : Spring Security permet de définir précisément les routes publiques/protégées

**Alternatives non retenues :**
- *Sessions classiques* : nécessitent du sticky sessions en cas de scaling horizontal
- *OAuth2 complet* : trop complexe pour les besoins du projet
- *Basic Auth* : non sécurisé, credentials envoyés à chaque requête

**Bibliothèque utilisée :**
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
```

---

### 2.6. PostgreSQL

**Ce que c'est :**
PostgreSQL est un système de gestion de base de données relationnelle open-source, réputé pour sa robustesse et sa conformité SQL.

**Pourquoi ce choix :**
- **Intégrité référentielle** : foreign keys, contraintes, transactions ACID
- **Performance** : excellent pour les requêtes complexes et les jointures
- **Types avancés** : JSON, tableaux, dates natives
- **Open-source** : pas de coût de licence
- **Standard en entreprise** : largement adopté dans l'industrie

**Alternatives non retenues :**
- *MySQL* : moins performant sur les requêtes complexes
- *H2 en mémoire* : données perdues au redémarrage, inadapté à la production
- *MongoDB* : modèle NoSQL inadapté aux relations entre entités

---

### 2.7. Maven

**Ce que c'est :**
Outil de build et de gestion de dépendances basé sur un fichier POM (Project Object Model) XML.

**Pourquoi ce choix :**
- **Standard Spring Boot** : configuration par défaut avec Spring Initializr
- **Gestion des versions** : parent POM Spring Boot gère la compatibilité
- **Lifecycle clair** : phases `compile`, `test`, `package` bien définies
- **Repository central** : accès à Maven Central pour les dépendances

**Alternatives non retenues :**
- *Gradle* : syntaxe plus concise mais courbe d'apprentissage plus élevée
- *Ant* : obsolète, trop verbeux

---

### 2.8. Swagger / OpenAPI (Springdoc)

**Ce que c'est :**
Outil de documentation et de test interactif d'API REST, généré automatiquement depuis le code.

**Pourquoi ce choix :**
- **Documentation vivante** : toujours synchronisée avec le code
- **Interface de test** : permet de tester les endpoints sans outil externe
- **Génération de clients** : possibilité de générer des SDKs
- **Standard OpenAPI 3.0** : format universel

**Configuration utilisée :**
```yaml
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    enabled: true
```

---

### 2.9. Lombok

**Ce que c'est :**
Bibliothèque qui génère automatiquement le code boilerplate Java (getters, setters, constructeurs, builders).

**Pourquoi ce choix :**
- **Réduction du code** : entités de 100 lignes réduites à 30
- **Maintenabilité** : modifications centralisées via annotations
- **Builder pattern** : création fluide d'objets avec `@Builder`

**Exemple du projet :**
```java
@Entity
@Table(name = "app_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    // ... Lombok génère getters, setters, equals, hashCode, toString
}
```

---

## 3. Architecture du backend

### 3.1. Organisation globale

Le projet suit une architecture en couches classique, conforme aux bonnes pratiques Spring :

```
src/main/java/com/ecoimpact/tracker/
├── EcoImpactTrackerApplication.java    # Point d'entrée
├── config/                              # Configuration
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── OpenApiConfig.java
│   ├── DataSeeder.java
│   ├── TestUserSeeder.java              # Seed d'un utilisateur test
│   └── RequestLoggingFilter.java        # Filtre de logging HTTP
├── controller/                          # Couche présentation (REST)
│   ├── AuthController.java
│   ├── EntryController.java
│   ├── ActivityTypeController.java
│   ├── ActivityTemplateController.java
│   ├── GoalController.java
│   ├── StatsController.java
│   └── ReportController.java
├── service/                             # Couche métier
│   ├── AuthService.java
│   ├── EntryService.java
│   ├── ActivityTypeService.java
│   ├── ActivityTemplateService.java
│   ├── GoalService.java
│   ├── StatsService.java
│   └── ReportService.java
├── repository/                          # Couche accès données
│   ├── AppUserRepository.java
│   ├── EntryRepository.java
│   ├── ActivityTypeRepository.java
│   ├── ActivityTemplateRepository.java
│   ├── GoalRepository.java
│   └── ReportRepository.java
├── domain/                              # Entités JPA
│   ├── AppUser.java
│   ├── Entry.java
│   ├── ActivityType.java
│   ├── ActivityTemplate.java
│   ├── Goal.java
│   ├── GoalPeriod.java
│   └── Report.java
├── dto/                                 # Data Transfer Objects
│   ├── AuthRequest.java
│   ├── AuthResponse.java
│   ├── RegisterRequest.java
│   ├── EntryRequest.java
│   ├── GoalRequest.java
│   ├── ReportRequest.java
│   ├── ActivityTypeRequest.java
│   ├── ActivityTemplateRequest.java
│   ├── StatsSummaryDTO.java
│   ├── StatsByDayDTO.java
│   └── StatsByTypeDTO.java
└── security/                            # Composants sécurité
    ├── JwtUtil.java
    ├── JwtRequestFilter.java
    └── CustomUserDetailsService.java
```

### 3.2. Séparation des responsabilités

| Couche | Responsabilité | Exemple |
|--------|---------------|---------|
| **Controller** | Réception des requêtes HTTP, validation, délégation | `EntryController.java` |
| **Service** | Logique métier, règles de gestion | `StatsService.java` |
| **Repository** | Accès à la base de données | `EntryRepository.java` |
| **Domain** | Modèle de données, entités JPA | `Entry.java` |
| **DTO** | Objets de transfert API | `EntryRequest.java` |
| **Security** | Authentification, autorisation | `JwtRequestFilter.java` |
| **Config** | Configuration transversale | `SecurityConfig.java` |

### 3.3. Logique REST stateless

L'API est conçue selon les principes REST :

- **Stateless** : chaque requête contient toutes les informations nécessaires (token JWT dans le header)
- **Ressources nommées** : `/entries`, `/activity-types`, `/goals`
- **Verbes HTTP** : GET (lecture), POST (création), PUT (mise à jour), DELETE (suppression)
- **Codes HTTP standardisés** : 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found)

### 3.4. Relations entre entités

```
                    ┌─────────────┐
                    │   AppUser   │
                    └──────┬──────┘
                           │ 1:N
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │  Entry   │   │   Goal   │   │  Report  │
     └────┬─────┘   └──────────┘   └──────────┘
          │ N:1
          ▼
┌─────────────────────┐
│  ActivityTemplate   │
└─────────┬───────────┘
          │ N:1
          ▼
   ┌──────────────┐
   │ ActivityType │
   └──────────────┘
```

**Description des relations :**
- Un **AppUser** possède plusieurs **Entry**, **Goal** et **Report** (1:N)
- Chaque **Entry** référence un **ActivityTemplate** (N:1)
- Chaque **ActivityTemplate** appartient à un **ActivityType** (N:1)

---

## 4. Base de données

### 4.1. Pourquoi PostgreSQL

PostgreSQL a été choisi pour les raisons suivantes :

1. **Intégrité relationnelle** : les relations entre User, Entry, Template sont critiques
2. **Transactions ACID** : cohérence garantie pour les calculs de statistiques
3. **Performance des jointures** : calculs CO₂ impliquent des jointures multiples
4. **Compatibilité Hibernate** : dialecte PostgreSQL parfaitement supporté

### 4.2. Modélisation des données

| Table | Description | Colonnes clés |
|-------|-------------|---------------|
| `app_users` | Utilisateurs de l'application | id, name, email, password_hash, created_at |
| `activity_types` | Catégories d'activités | id, name, unit, description |
| `activity_templates` | Modèles avec facteurs CO₂ | id, name, default_unit, co2_factor, source, activity_type_id |
| `entries` | Saisies utilisateur | id, quantity, date, note, user_id, activity_template_id |
| `goals` | Objectifs de réduction | id, period, target_co2, start_date, end_date, user_id |
| `reports` | Rapports générés | id, period_start, period_end, total_co2, created_at, user_id |

### 4.3. Stratégie de persistance

**Mode DDL-Auto :**
```yaml
jpa:
  hibernate:
    ddl-auto: update
```

- **`update`** : Hibernate crée ou modifie les tables automatiquement au démarrage
- Adapté au développement et prototypage
- En production, on utiliserait des migrations (Flyway/Liquibase)

### 4.4. Gestion des identifiants

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

- **IDENTITY** : PostgreSQL gère les séquences automatiquement
- Identifiants `Long` pour supporter un grand nombre d'enregistrements

### 4.5. Seeding initial du catalogue CO₂

Le `DataSeeder` implémente `CommandLineRunner` pour pré-remplir la base au démarrage :

```java
@Component
public class DataSeeder implements CommandLineRunner {
    @Override
    public void run(String... args) {
        // Lecture du fichier catalog-seed.json
        // Insertion des ActivityTypes et ActivityTemplates
    }
}
```

**Fonctionnalités :**
- Chargement depuis `catalog-seed.json` (facteurs ADEME)
- Vérification de duplication avant insertion
- Option `SEED_FORCE=true` pour réinitialiser

---

## 5. Sécurité et authentification

### 5.1. Fonctionnement de l'authentification

Le flux d'authentification suit ces étapes :

```
1. POST /auth/register ou /auth/login
   └─→ Validation des credentials
   └─→ Génération du token JWT
   └─→ Retour du token au client

2. Requêtes suivantes
   └─→ Header: Authorization: Bearer <token>
   └─→ JwtRequestFilter intercepte
   └─→ Validation du token
   └─→ Injection dans SecurityContext
   └─→ Accès autorisé ou refusé
```

### 5.2. JWT : principe et cycle de vie

**Structure d'un token JWT :**
```
header.payload.signature
```

**Implémentation dans JwtUtil.java :**
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

**Cycle de vie :**
1. **Création** : à la connexion/inscription, durée 24h
2. **Utilisation** : envoyé dans chaque requête protégée
3. **Validation** : vérifié à chaque requête par le filtre
4. **Expiration** : après 24h, l'utilisateur doit se reconnecter

### 5.3. Routes publiques vs protégées

**Configuration dans SecurityConfig.java :**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/auth/**").permitAll()
    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
    .anyRequest().authenticated())
```

| Route | Accès | Justification |
|-------|-------|---------------|
| `/auth/**` | Public | Inscription/connexion |
| `/swagger-ui/**` | Public | Documentation API |
| Toutes les autres | Authentifié | Protection des données utilisateur |

### 5.4. Problèmes rencontrés et solutions

#### Problème 1 : Erreurs CORS

**Symptôme :** Le frontend React (port 5173) ne pouvait pas appeler le backend (port 8081).

**Cause :** Les navigateurs bloquent les requêtes cross-origin par sécurité.

**Solution :**
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "Accept",
                "Origin", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

#### Problème 2 : Erreurs 403 Forbidden

**Symptôme :** Toutes les requêtes retournaient 403 même avec un token valide.

**Cause :** CSRF activé par défaut bloquait les requêtes POST/PUT/DELETE.

**Solution :**
```java
http.csrf(AbstractHttpConfigurer::disable)
```

#### Problème 3 : Header Authorization non transmis

**Symptôme :** Le token n'arrivait pas au backend.

**Cause :** CORS bloquait le header `Authorization`.

**Solution :** Ajout explicite dans `allowedHeaders`.

---

## 6. API et communication avec le frontend

### 6.1. Structure des endpoints REST

**Authentification (public) :**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Inscription utilisateur |
| POST | `/auth/login` | Connexion utilisateur |

**Entrées (authentifié) :**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/entries` | Création d'une entrée |
| GET | `/entries` | Liste des entrées de l'utilisateur |
| GET | `/entries/{id}` | Détail d'une entrée |
| GET | `/entries/range?from=&to=` | Entrées dans une plage de dates |
| PUT | `/entries/{id}` | Mise à jour d'une entrée |
| DELETE | `/entries/{id}` | Suppression d'une entrée |

**Types d'activités (authentifié) :**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/activity-types` | Création d'un type |
| GET | `/activity-types` | Liste des types d'activités |
| GET | `/activity-types/{id}` | Détail d'un type |
| PUT | `/activity-types/{id}` | Mise à jour d'un type |
| DELETE | `/activity-types/{id}` | Suppression d'un type |

**Modèles d'activités (authentifié) :**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/activity-templates` | Création d'un modèle |
| GET | `/activity-templates` | Liste de tous les modèles |
| GET | `/activity-templates/{id}` | Détail d'un modèle |
| GET | `/activity-templates/by-type/{activityTypeId}` | Modèles filtrés par type |
| PUT | `/activity-templates/{id}` | Mise à jour d'un modèle |
| DELETE | `/activity-templates/{id}` | Suppression d'un modèle |

**Objectifs (authentifié) :**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/goals` | Création d'un objectif |
| GET | `/goals` | Liste des objectifs |
| GET | `/goals/{id}` | Détail d'un objectif |
| PUT | `/goals/{id}` | Mise à jour d'un objectif |
| DELETE | `/goals/{id}` | Suppression d'un objectif |

**Rapports (authentifié) :**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/reports` | Création d'un rapport |
| GET | `/reports` | Liste des rapports |
| GET | `/reports/{id}` | Détail d'un rapport |
| DELETE | `/reports/{id}` | Suppression d'un rapport |

**Statistiques (authentifié) :**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/stats/summary?from=&to=` | Statistiques résumées sur période |
| GET | `/stats/by-day?from=&to=` | Émissions par jour |
| GET | `/stats/by-type?from=&to=` | Émissions par type d'activité |

### 6.2. Format des requêtes et réponses

**Requête de création d'entrée :**
```json
POST /entries
Content-Type: application/json
Authorization: Bearer <token>

{
    "quantity": 50,
    "date": "2026-01-15",
    "note": "Trajet domicile-travail",
    "activityTemplateId": 1
}
```

**Réponse :**
```json
{
    "id": 1,
    "quantity": 50,
    "date": "2026-01-15",
    "note": "Trajet domicile-travail",
    "activityTemplate": {
        "id": 1,
        "name": "Voiture essence",
        "co2Factor": 0.192,
        "defaultUnit": "km"
    }
}
```

### 6.3. Rôle de Swagger

Swagger UI accessible sur `http://localhost:8081/swagger-ui/index.html` permet :

- **Visualisation** de tous les endpoints disponibles
- **Test interactif** des API sans outil externe
- **Documentation** des paramètres et codes de retour
- **Authentification** via bouton "Authorize" pour tester les routes protégées

### 6.4. Problèmes de mismatch frontend/backend

#### Problème : Format de date incompatible

**Symptôme :** Le frontend envoyait des dates en format différent.

**Solution :** Utilisation systématique du format ISO `yyyy-MM-dd` côté backend et frontend.

#### Problème : Champs manquants dans les réponses

**Symptôme :** Le frontend attendait des champs non présents dans la réponse.

**Solution :** Ajout des champs manquants dans les DTOs et annotations Jackson appropriées.

---

## 7. Problèmes rencontrés et résolutions

### 7.1. Port 8080 déjà utilisé

**Problème :** Le port par défaut 8080 était occupé.

**Diagnostic :** Commande `lsof -ti:8080` montrait un processus existant.

**Solution :**
```yaml
server:
  port: 8081
```

**Apprentissage :** Toujours vérifier la disponibilité des ports et rendre le port configurable.

---

### 7.2. Lombok non reconnu par le compilateur

**Problème :** Erreurs de compilation, getters/setters non générés.

**Diagnostic :** L'annotation processor n'était pas configuré dans Maven.

**Solution :**
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>1.18.30</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

**Apprentissage :** Lombok nécessite une configuration explicite avec Java 17+.

---

### 7.3. Boucle infinie de sérialisation JSON

**Problème :** `StackOverflowError` lors de la sérialisation des entités avec relations bidirectionnelles.

**Diagnostic :** Jackson sérialisait User → Entries → User → Entries...

**Solution :**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id")
@JsonIgnore  // Rompt le cycle
private AppUser user;
```

**Apprentissage :** Toujours annoter un côté des relations bidirectionnelles avec `@JsonIgnore`.

---

### 7.4. Chargement des associations (stratégie EAGER vs LAZY)

**Problème :** Lors du calcul des statistiques, chaque entrée doit accéder à son `ActivityTemplate` et au `ActivityType` associé pour obtenir le `co2Factor`. Si ces associations étaient en chargement `LAZY`, Hibernate exécuterait une requête supplémentaire par entrée (problème N+1).

**Solution retenue :** Le chargement `EAGER` sur la relation `Entry → ActivityTemplate` :
```java
// Dans Entry.java
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "activity_template_id", nullable = false)
private ActivityTemplate activityTemplate;
```

Avec une requête JPQL dédiée dans le repository :
```java
@Query("SELECT e FROM Entry e WHERE e.user.id = :userId " +
       "AND e.date BETWEEN :startDate AND :endDate")
List<Entry> findEntriesForStats(@Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);
```

Grâce au `FetchType.EAGER`, Hibernate charge automatiquement le template associé lors de la récupération de chaque entrée, évitant les requêtes supplémentaires explicites.

**Apprentissage :** Le `FetchType.EAGER` est adapté quand l'association est systématiquement nécessaire (comme ici pour les calculs CO₂). Pour les associations rarement utilisées, le `LAZY` avec `JOIN FETCH` explicite serait préférable.

---

### 7.5. Token JWT expiré non géré

**Problème :** Après 24h, l'utilisateur voyait des erreurs 401 sans explication.

**Diagnostic :** Le frontend ne gérait pas correctement l'expiration.

**Solution :** Ajout d'un interceptor Axios côté frontend pour détecter les 401 et rediriger vers `/login`.

**Apprentissage :** La gestion des erreurs d'authentification doit être pensée end-to-end.

---

## 8. Logs et observabilité

### 8.1. Gestion des logs

La configuration des logs dans `application.yml` :

```yaml
logging:
  level:
    root: INFO
    org.springframework: WARN
    org.springframework.security: WARN
    org.hibernate: ERROR
    org.hibernate.SQL: OFF
    com.ecoimpact.tracker: INFO
```

### 8.2. Choix des niveaux

| Package | Niveau | Justification |
|---------|--------|---------------|
| `root` | INFO | Informations générales |
| `org.springframework` | WARN | Réduire la verbosité |
| `org.hibernate.SQL` | OFF | Éviter le spam de requêtes |
| `com.ecoimpact.tracker` | INFO | Logs applicatifs visibles |

### 8.3. Logs applicatifs

Le `DataSeeder` utilise des logs structurés :

```java
log.info("========================================");
log.info("Database seeding completed!");
log.info("  Types:     {} seeded", typeMap.size());
log.info("  Templates: {} inserted", templatesInserted);
log.info("========================================");
```

### 8.4. Importance en backend

Les logs sont essentiels pour :
- **Debugging** : comprendre le flux d'exécution
- **Monitoring** : détecter les anomalies en production
- **Audit** : tracer les actions utilisateur
- **Performance** : identifier les goulots d'étranglement

---

## 9. Limites actuelles et améliorations possibles

### 9.1. Améliorations techniques

| Domaine | Limite actuelle | Amélioration proposée |
|---------|-----------------|----------------------|
| **Tests** | Aucun test unitaire | Ajouter JUnit 5, Mockito, tests d'intégration |
| **Validation** | Basique | Validations métier plus poussées |
| **Gestion d'erreurs** | Exceptions génériques | `@ControllerAdvice` pour erreurs standardisées |
| **Migrations** | DDL-auto | Flyway ou Liquibase pour migrations versionnées |

### 9.2. Sécurité renforcée

- **Rate limiting** : limiter les tentatives de connexion
- **Refresh tokens** : éviter la reconnexion toutes les 24h
- **HTTPS** : chiffrement en production
- **Audit logging** : tracer les actions sensibles

### 9.3. Performance

- **Caching** : Spring Cache pour les données peu changées (types, templates)
- **Pagination** : limiter les réponses volumineuses
- **Indexes** : optimiser les requêtes fréquentes
- **Connection pooling** : HikariCP déjà présent, tuning possible

### 9.4. Scalabilité

En contexte industriel :
- **Conteneurisation** : Docker pour déploiement reproductible
- **Orchestration** : Kubernetes pour le scaling horizontal
- **Base distribuée** : PostgreSQL en cluster ou read replicas
- **API Gateway** : centralisation des accès, rate limiting

---

## 10. Conclusion

### 10.1. Bilan du backend

Le backend ECO Impact Tracker est une application Spring Boot complète qui démontre :

- Une **architecture en couches** claire et maintenable
- Une **sécurité robuste** avec JWT et Spring Security
- Une **modélisation relationnelle** cohérente avec JPA/Hibernate
- Une **API REST** bien structurée et documentée
- Un **catalogue CO₂** pré-rempli pour une utilisation immédiate

### 10.2. Compétences démontrées

Ce projet illustre la maîtrise de :

| Compétence | Mise en œuvre |
|------------|---------------|
| Développement Java moderne | Java 17, Lombok, Stream API |
| Framework Spring | Boot, Web, Data JPA, Security |
| Persistence de données | PostgreSQL, Hibernate, requêtes optimisées |
| Sécurité applicative | JWT, BCrypt, CORS, routes protégées |
| Architecture REST | Endpoints standardisés, DTOs, codes HTTP |
| Documentation | OpenAPI/Swagger, code commenté |
| Résolution de problèmes | Debug, logs, correction d'erreurs |

### 10.3. Apports pédagogiques

Ce projet a permis d'apprendre :

1. **L'écosystème Spring** : comprendre comment les modules s'intègrent
2. **La sécurité web** : complexité de l'authentification stateless
3. **Les ORM** : avantages et pièges de JPA/Hibernate
4. **L'intégration full-stack** : coordination backend/frontend
5. **Le debugging backend** : lecture des logs, analyse des erreurs
6. **Les bonnes pratiques** : séparation des responsabilités, DTOs, validation

---

**Document rédigé dans le cadre du projet ECO Impact Tracker**  
*Cours d'Architectures Web — Janvier 2026*
