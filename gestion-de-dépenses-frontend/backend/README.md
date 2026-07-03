# 💰 Expense Tracker Backend - Spring Boot 3 & Java 21

Ce projet est le backend professionnel d'une application de gestion des dépenses personnelles (**Expense Tracker**). Conçu en suivant les bonnes pratiques **SOLID** et une architecture en couches propre, il est hautement performant, sécurisé et prêt pour la production.

---

## 🚀 Fonctionnalités Clés

### 🔒 Sécurité et Authentification
*   **Système d'inscription et de connexion** avec validation d'emails uniques.
*   **Authentification sans état (Stateless) par JWT** (JSON Web Tokens).
*   **Hachage des mots de passe avec BCrypt** (Spring Security).
*   Gestion globale des accès : toutes les routes sont sécurisées sauf l'authentification et Swagger UI.

### 📁 Gestion des Catégories (Isolées par Utilisateur)
*   **CRUD Complet** : Création, modification, lecture, et suppression.
*   Chaque utilisateur gère ses propres catégories personnalisées avec des attributs de style (`name`, `color`, `icon`).
*   Sécurité anti-suppression accidentelle si la catégorie possède des dépenses rattachées.

### 💸 Gestion des Dépenses (Expenses)
*   **CRUD Complet** pour consigner chaque dépense (`title`, `description`, `amount`, `expenseDate`, etc.).
*   **Filtres de recherche avancés** et combinatoires :
    *   Filtrage par Catégorie.
    *   Filtrage par Période (Date de début et Date de fin).
    *   Filtrage par montant minimum et maximum.

### 📊 Budgets Mensuels & Notifications
*   Définition d'un budget maximum par mois et par année (`month`, `year`, `amount`).
*   **Calculs financiers automatiques** :
    *   Montant cumulé dépensé sur le mois.
    *   Solde restant.
    *   Pourcentage de consommation du budget.
*   **Système de Notification d'alerte** intégré : si le cumul des dépenses mensuelles dépasse le budget défini, l'API renvoie un avertissement actif (`warning=true`, `message="Budget dépassé"`).

### 📈 Dashboard & Statistiques Avancées
*   Endpoints consolidés en une seule requête optimisée en mémoire :
    *   Total général des dépenses et nombre de transactions.
    *   Total consommé pour le mois en cours.
    *   Répartition complète des dépenses par catégorie.
    *   Top 5 des catégories de dépenses avec pourcentages.
    *   Évolution mensuelle historique (tendance des 6 derniers mois).

---

## 🛠️ Stack Technique

*   **Runtime** : Java 21 (LTS)
*   **Framework** : Spring Boot 3.3.1
*   **Sécurité** : Spring Security & JJWT (Json Web Token)
*   **Persistance** : Spring Data JPA, Hibernate, PostgreSQL
*   **Compilation** : Maven 3
*   **Utilitaires** : Lombok, MapStruct (DTO Mapping), Jakarta Validation
*   **Documentation** : Springdoc Swagger UI (OpenAPI 3)
*   **DevOps** : Docker, Docker-Compose

---

## 📁 Structure du Projet

L'architecture respecte scrupuleusement l'organisation en couches :

```text
com.expensetracker
│
├── config                      # Configuration globale (Swagger OpenAPI)
├── controller                  # Contrôleurs REST (Exposition des Endpoints)
├── dto                         # Objets de Transfert de Données (DTO)
│     ├── request               # Formulaires reçus (Validation @NotBlank, etc.)
│     └── response              # Réponses standardisées retournées
├── entity                      # Entités JPA d'accès à la base PostgreSQL
├── repository                  # Interfaces Spring Data JPA
├── security                    # Composants Spring Security
│      ├── jwt                  # Filtres, Utilities et Point d'entrée JWT
│      ├── config               # Chaîne de filtres de sécurité (WebSecurityConfig)
│      └── service              # Service utilisateur (UserDetails / UserDetailsService)
├── service                     # Logique Métier
│      ├── impl                 # Implémentations concrètes des services
│      └── interfaces           # Contrats d'interfaces de services
├── exception                   # Gestionnaires et exceptions personnalisées
├── mapper                      # Interfaces de mapping MapStruct
├── utils                       # Utilitaires système (SecurityUtils)
└── ExpenseTrackerApplication   # Point d'entrée principal de l'application
```

---

## 🐳 Comment Lancer le Projet ?

### Prérequis
*   **Docker** & **Docker-Compose** installés sur votre machine OU **Java 21** et **PostgreSQL**.

### Méthode 1 : Démarrage Rapide avec Docker Compose (Recommandé)
Démarre automatiquement l'application Spring Boot et une base de données PostgreSQL isolée.

1.  Placez-vous dans le dossier `/backend`.
2.  Exécutez la commande suivante :
    ```bash
    docker-compose up --build
    ```
3.  Le serveur démarrera sur le port **8080**.

### Méthode 2 : Lancement Local avec Maven
Si vous préférez exécuter l'application sur votre système :

1.  Assurez-vous qu'une instance PostgreSQL tourne localement sur le port `5432` avec une base nommée `expensetracker`.
2.  Configurez vos variables d'environnement ou laissez les valeurs par défaut définies dans `/src/main/resources/application.yml`.
3.  Compilez et lancez l'application :
    ```bash
    mvn clean spring-boot:run
    ```

---

## 📚 Documentation API & Swagger

Une fois l'application lancée, la documentation Swagger interactive est accessible aux adresses suivantes :

*   **Interface Graphique Swagger UI** : `http://localhost:8080/api/swagger-ui.html`
*   **Spécification JSON OpenAPI** : `http://localhost:8080/api/v3/api-docs`

> 💡 **Tip d'authentification dans Swagger UI** :
> 1. Appelez le endpoint `/api/auth/login` pour récupérer le token de session.
> 2. Cliquez sur le bouton **Authorize** en haut à droite de l'interface Swagger.
> 3. Collez votre token JWT (sans le préfixe Bearer, juste la chaîne de caractères) et validez !

---

## 📌 Liste complète des Endpoints REST

Toutes les requêtes de données retournent une structure JSON standardisée :
```json
{
    "success": true,
    "message": "...",
    "data": { ... }
}
```

### 🔐 Authentification (Public)
*   `POST /api/auth/register` : Crée un compte utilisateur.
*   `POST /api/auth/login` : Connecte un utilisateur et retourne un JWT Token.

### 📁 Gestion des Catégories (Privé - JWT Requis)
*   `GET /api/categories` : Liste toutes les catégories de l'utilisateur.
*   `POST /api/categories` : Crée une nouvelle catégorie.
*   `PUT /api/categories/{id}` : Modifie une catégorie existante.
*   `DELETE /api/categories/{id}` : Supprime une catégorie (si non rattachée à des dépenses).

### 💸 Gestion des Dépenses (Privé - JWT Requis)
*   `GET /api/expenses` : Liste toutes les dépenses de l'utilisateur.
*   `GET /api/expenses/{id}` : Récupère les détails d'une dépense spécifique.
*   `POST /api/expenses` : Enregistre une nouvelle dépense.
*   `PUT /api/expenses/{id}` : Modifie une dépense existante.
*   `DELETE /api/expenses/{id}` : Supprime une dépense.
*   `GET /api/expenses/filter` : Filtre les dépenses selon les critères de recherche.

### 💰 Gestion des Budgets (Privé - JWT Requis)
*   `GET /api/budget` : Récupère l'état du budget mensuel (total dépenses, montant restant, pourcentage, alertes).
*   `POST /api/budget` : Configure un nouveau budget mensuel.
*   `PUT /api/budget` : Modifie le budget du mois en cours.

### 📊 Tableau de Bord (Privé - JWT Requis)
*   `GET /api/dashboard` : Synthèse globale rapide.
*   `GET /api/dashboard/statistics` : Métriques détaillées, répartition par catégories et historique mensuel.
