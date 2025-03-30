# 📝 Palette Couleur

Palette Couleur est une application web interactive dédiée à l'exploration de la psychologie des couleurs et du design. Cette plateforme permet aux utilisateurs de découvrir des articles sur l'impact des couleurs sur nos émotions, perceptions et décisions, ainsi que leur application dans le design contemporain.

---

## 🚀 Fonctionnalités

- **Exploration d'articles** : Parcourez une collection d'articles sur la psychologie des couleurs.
- **Système d'authentification** : Inscription et connexion des utilisateurs.
- **Commentaires** : Les abonnés peuvent commenter les articles.
- **Création de contenu** : Les abonnés peuvent publier leurs propres articles.
- **Profil utilisateur** : Gestion des informations personnelles.
- **Panel d'administration** : Gestion des utilisateurs, articles et commentaires.
- **Design réactif** : Interface adaptative pour tous les appareils.

---

## 💻 Prérequis

- **Node.js** (v16.0.0 ou supérieur)
- **npm** (v7.0.0 ou supérieur)
- **PHP** 8.1 ou supérieur (pour le backend)
- **Composer** (pour le backend)
- **Symfony CLI** (recommandé)
- **Base de données** MySQL/MariaDB

---

## 🔧 Installation

### Configuration du Backend (API)

1. Clonez le dépôt backend via le lien suivant :  
   [https://github.com/Wysath/cms-headless](https://github.com/Wysath/cms-headless)
2. Suivez les instructions du README pour l'installation.

Le backend sera disponible à l'adresse : `https://127.0.0.1:8000`

### Configuration du Frontend (Vue.js)

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/Wysath/FrontVueJS.git
   cd FrontVueJS
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```

---

## 🏃‍♂️ Démarrer l'application

### Backend

Assurez-vous que le serveur backend est en cours d'exécution.

### Frontend en mode développement

1. Lancez le serveur de développement :
   ```bash
   cd FrontVueJS
   npm run dev
   ```
2. L'application sera disponible à l'adresse : `http://localhost:5173`

### Compilation pour la production

- Pour compiler l'application :
  ```bash
  npm run build
  ```

---

## 🧪 Tests

Le projet utilise **Cypress** pour les tests end-to-end.

- Ouvrir l'interface de Cypress :
  ```bash
  npx cypress open
  ```
---

## 📁 Structure du projet

```plaintext
src/
├── assets/          # Ressources statiques (CSS, images)
├── components/      # Composants Vue réutilisables
│   ├── admin/       # Composants d'administration
│   ├── icons/       # Icônes SVG
│   └── __tests__/   # Tests des composants
├── router/          # Configuration des routes
├── services/        # Services (API, etc.)
├── stores/          # Gestion d'état (session, etc.)
└── views/           # Pages principales
```

---

## 🔄 Intégration avec le backend

L'application communique avec l'API backend via le service `api.js`. Pour fonctionner correctement, assurez-vous que :

- Le backend est en cours d'exécution sur `https://127.0.0.1:8000`.
- Le fichier `.env` du frontend contient la bonne URL du backend.
- Le **CORS** est correctement configuré sur le backend pour accepter les requêtes du frontend.

### Commandes utiles du backend

Pour gérer les utilisateurs et les rôles depuis la ligne de commande, consultez le README du backend pour plus d'informations.

---

## 🛠️ Technologies utilisées

- **Vue.js 3** : Framework JavaScript progressif.
- **Vue Router** : Routeur officiel pour Vue.js.
- **Cypress** : Framework de test end-to-end.
- **CSS personnalisé** : Avec variables et animations.
- **Symfony 6** : Framework PHP pour le backend.
- **API Platform** : Framework pour la création d'API REST/GraphQL.

---

## 🖋️ Fonctionnalités à venir

- Système d'abonnement complet.
- Paiement en ligne pour les abonnements premium.
- Fonctionnalités sociales avancées.
- Galeries d'inspiration couleur.
- Intégration d'un système de newsletter.

---

## 📜 Licence

Ce projet est sous licence **MIT**.

---

## 👤 Auteur

Louna Petitfils
Documentation mise à jour le **29 mars 2025**.
