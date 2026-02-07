[English](README.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Italiano](README.it.md) | [Español](README.es.md) | [Polski](README.pl.md) | [Português](README.pt.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [हिन्दी](README.hi.md)

# 🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit

Développement logiciel autonome propulsé par l'IA avec auto-amélioration, sélection intelligente de modèles et application des meilleures pratiques.

> "Houston, nous avons le décollage !" 🚀

**Maintenant propulsé par TypeScript pour une meilleure fiabilité et sécurité des types !**

📚 **[Documentation Interactive](docs/index.html)** - Essayez les commandes ORBIT dans le playground navigateur !

## Démarrage Rapide

### Installation

```bash
# Option 1: npm (toutes plateformes)
npm install -g @davrock/orbit

# Option 2: Depuis les sources (Unix/macOS)
git clone https://github.com/davrock/orbit.git && cd orbit && ./install.sh

# Option 3: Depuis les sources (Windows PowerShell)
git clone https://github.com/davrock/orbit.git; cd orbit; .\install.ps1
```

### Utilisation

```bash
# Workflow complet de fonctionnalité
orbit launch "ajouter authentification utilisateur"

# Correction de bug (utilise des modèles moins chers)
orbit repair "corriger crash de connexion"

# Boucle d'auto-amélioration (traite d'abord la file)
orbit evolve

# Vérifier la configuration détectée
orbit config
```

## 🚀 Missions (Workflows)

| Mission | Phases | Cas d'Usage |
|---------|--------|-------------|
| `launch` | plan → implement → test → review → commit | Nouvelles fonctionnalités |
| `repair` | debug → implement → test → commit | Corrections de bugs |
| `warp` | implement → commit | Changements rapides |
| `mayday` | debug → implement → commit | Hotfixes |
| `preflight` | test → implement → test → review → commit | Workflow TDD |
| `shields-up` | plan → implement → security → test → review → commit | Critique sécurité |
| `dock` | plan → implement → test → document → commit | Développement API |
| `transmit` | implement → review → commit | Documentation |
| `apollo` | toutes les phases | Complet |
| `ralph` | implement → test → review → commit | **Mode persistant** (n'abandonne jamais) |
| `plan` | interview → requirements | **Collecte des exigences** (interview de planification) |
| `ultrawork` | plan → implement → review → commit | **Exécution parallèle** (sous-tâches indépendantes) |
| `swarm` | plan → implement → review → commit | **Parallèle coordonné** (avec dépendances) |
| `pipeline` | plan → implement → test → review → commit | **Étapes séquentielles** (passages entre étapes) |

```bash
orbit missions  # Lister toutes
```

### 🎤 Mode Plan - Collecte Interactive des Exigences

La commande `plan` mène une interview de planification interactive pour collecter les exigences détaillées avant l'exécution :

```bash
# Collecte d'exigences autonome
orbit plan "ajouter fonctionnalité panier"

# Utiliser avec n'importe quelle mission via le flag --plan
orbit launch --plan "ajouter authentification utilisateur"
orbit warp --plan "refactoriser couche base de données"
```

**Comment ça marche :**
- **Questions générées par l'IA** : Génère 5-7 questions de clarification basées sur votre tâche
- **Interview interactive** : Pose des questions via l'interaction Copilot CLI
- **Synthèse intelligente** : Crée une spécification détaillée des exigences à partir des réponses
- **Intégration automatique** : Les exigences sont transmises aux membres de l'équipe pendant l'exécution
- **Sauvegarde des spécifications** : Stocke les exigences collectées dans `.copilot/state/plan_requirements.json`

### 🔄 Mode Ralph - Persistance qui N'abandonne Jamais

La mission `ralph` est un mode de persistance spécial qui n'abandonne pas tant que la tâche n'est pas vérifiée comme terminée :

```bash
orbit ralph "implémenter fonctionnalité complexe"
orbit ralph --max-attempts 15 "refactoring difficile"
```

**Comment ça marche :**
- **Réessai automatique** : Réessaie les phases échouées jusqu'à 10 fois (configurable)
- **Escalade intelligente** : Escalade le niveau de modèle (fast → standard → premium) après 2 tentatives
- **Rotation d'équipe** : Change de membre d'équipe après 4 tentatives pour une nouvelle perspective
- **Variation d'approche** : Essaie différentes stratégies d'implémentation toutes les 3 tentatives
- **Vérification** : Valide l'achèvement de chaque phase avant de continuer

### ⚡ Modes d'Exécution Parallèle

ORBIT offre deux modes pour l'exécution parallèle des tâches :

#### 🚀 Mode Ultrawork - Tâches Parallèles Indépendantes

Distribue les sous-tâches indépendantes sur des sessions concurrentes :

```bash
orbit ultrawork "refactoriser codebase avec modules indépendants multiples"
orbit ultrawork --concurrency 6 "optimiser performance sur les composants"
```

#### 🐝 Mode Swarm - Exécution Parallèle Coordonnée

Distribution intelligente des tâches avec conscience des dépendances :

```bash
orbit swarm "implémenter système d'authentification utilisateur"
orbit swarm --concurrency 4 "construire API avec base de données et tests"
```

## 🧠 Sélection Intelligente de Modèle

Sélectionne automatiquement le modèle LLM optimal par tâche pour économiser des tokens :

| Niveau | Icône | Coût | Cas d'Usage |
|--------|-------|------|-------------|
| `premium` | 🔥 | 3x | Architecture, sécurité, débogage complexe |
| `standard` | ⚡ | 1x | Développement général, tests, reviews |
| `fast` | 💨 | 0.5x | Docs, formatage, corrections simples |
| `ecomode` | 🌱 | 0.6x | **Économique** (30-50% d'économies) |

```bash
orbit launch --premium "audit sécurité"         # Forcer premium
orbit transmit --economy "mettre à jour README" # Forcer fast
orbit launch --ecomode "ajouter fonctionnalité" # Mode économique
orbit fuel                                       # Voir utilisation tokens
```

## 🤖 Intégration Fournisseurs IA

Validation croisée optionnelle et vérifications de cohérence avec plusieurs fournisseurs IA :

```bash
# Configurer fournisseurs externes (optionnel)
export GEMINI_API_KEY="votre-clé"
export OPENAI_API_KEY="votre-clé"
export ANTHROPIC_API_KEY="votre-clé"

# Activer validation croisée entre fournisseurs
orbit launch "implémenter API paiement" --cross-validate
```

## 📚 Meilleures Pratiques

Tous les membres de l'équipe référencent `.copilot/best-practices.yaml` pour les standards :
- Standards de codage (TypeScript, Python, JavaScript)
- Patterns de test (arrange-act-assert, nommage)
- Directives de sécurité (OWASP, validation d'entrée)
- Conventions de documentation
- Standards de commit Git

## 🧑‍🚀 Équipage (Agents)

| Équipage | Rôle | Modèle |
|----------|------|--------|
| `commander` | Architecte système | 🔥 premium |
| `pilot` | Implémenteur | ⚡ standard |
| `engineer` | Détective bugs | 🔥 premium |
| `navigator` | Réviseur de code | ⚡ standard |
| `specialist` | Héros QA | ⚡ standard |
| `security-officer` | Ninja sécurité | 🔥 premium |
| `propulsion` | Performance | ⚡ standard |
| `comms` | Documentation | 💨 fast |

```bash
orbit crews
orbit launch --crew security-officer "ajouter auth"
```

## 🧬 Boucle d'Auto-Amélioration

Ordre de priorité : **File → GitHub Issues → Auto-Amélioration**

```bash
orbit evolve              # Exécuter jusqu'à arrêt
orbit evolve --once       # Cycle unique
orbit evolve --turbo      # Mode rapide (30s délai)
orbit evolve --max 50     # Limiter les cycles
orbit status              # Afficher historique
orbit reset               # Réinitialiser compteurs failsafe
```

### Manifeste Cargo (File de Tâches)

```bash
# Ajouter tâches
orbit cargo-add "Ajouter authentification utilisateur" --priority high
orbit cargo-add "Ajouter toggle mode sombre"

# Voir file
orbit cargo

# Traiter tout
orbit cargo-run
```

### Failsafes Ground Control 🚨

Empêche les boucles infinies :
- ✓ Max 3 échecs consécutifs → pause
- ✓ Max 5 cycles sans progrès → abandon mission
- ✓ Détecte améliorations répétitives → variété requise
- ✓ Citations spatiales ("Houston, nous avons un problème !")

## 📋 Planification d'Implémentation

Générer des plans détaillés et des issues GitHub :

```bash
# Créer un plan de vol pour une fonctionnalité
orbit flight-plan new "Ajouter authentification OAuth2"

# Analyse plus approfondie
orbit flight-plan new "Refactoriser couche base de données" --depth 3

# Lister tous les plans
orbit flight-plan list

# Générer issues GitHub depuis un plan
orbit flight-plan issues plan-001
```

## Développement

```bash
# Mode développement (utilise tsx)
npm run dev -- launch "tâche"

# Compiler TypeScript
npm run build

# Vérification des types
npm run typecheck

# Lier globalement
npm link
```

## 💖 Soutenir et Contribuer

### Sponsors

Si ORBIT vous fait gagner du temps et améliore votre productivité, envisagez de sponsoriser :

- ⭐ **Mettre une étoile au repo** - aide les autres à découvrir ORBIT
- 💰 **GitHub Sponsors** - [Sponsoriser @davrock](https://github.com/sponsors/davrock)
- ☕ **M'offrir un café** - Soutient le développement continu

### Contribuer

Les contributions sont bienvenues ! Voici comment :

```bash
# Fork et cloner
git clone https://github.com/votre-username/orbit.git
cd orbit

# Installer dépendances
npm install

# Faire vos modifications
npm run dev -- launch "votre amélioration"

# Build et test
npm run build
npm run typecheck

# Soumettre PR
git push origin feature/votre-amélioration
```

## Licence

MIT
