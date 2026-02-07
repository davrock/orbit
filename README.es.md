[English](README.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Italiano](README.it.md) | [Español](README.es.md) | [Polski](README.pl.md) | [Português](README.pt.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md)

# 🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit

Desarrollo de software autónomo impulsado por IA con automejora, selección inteligente de modelos y aplicación de mejores prácticas.

> "¡Houston, tenemos despegue!" 🚀

**¡Ahora potenciado por TypeScript para mejor confiabilidad y seguridad de tipos!**

## Inicio Rápido

### Instalación

```bash
# Opción 1: npm (cualquier plataforma)
npm install -g @davrock/orbit

# Opción 2: Desde fuente (Unix/macOS)
git clone https://github.com/davrock/orbit.git && cd orbit && ./install.sh

# Opción 3: Desde fuente (Windows PowerShell)
git clone https://github.com/davrock/orbit.git; cd orbit; .\install.ps1
```

### Uso

```bash
# Flujo de trabajo completo
orbit launch "add user authentication"

# Corrección de errores (usa modelos más baratos)
orbit repair "fix login crash"

# Bucle de automejora (procesa cola primero)
orbit evolve

# Verificar configuración detectada
orbit config
```

## 🚀 Misiones (Flujos de Trabajo)

| Misión | Fases | Caso de Uso |
|---------|--------|----------|
| `launch` | plan → implement → test → review → commit | Nuevas funciones |
| `repair` | debug → implement → test → commit | Corrección de errores |
| `warp` | implement → commit | Cambios rápidos |
| `mayday` | debug → implement → commit | Correcciones urgentes |
| `preflight` | test → implement → test → review → commit | Flujo TDD |
| `shields-up` | plan → implement → security → test → review → commit | Sensible a seguridad |
| `dock` | plan → implement → test → document → commit | Desarrollo API |
| `transmit` | implement → review → commit | Documentación |
| `apollo` | todas las fases | Integral |
| `ralph` | implement → test → review → commit | **Modo persistente** (nunca se rinde) |
| `plan` | interview → requirements | **Recopilación de requisitos** (entrevista de planificación) |
| `ultrawork` | plan → implement → review → commit | **Ejecución paralela** (subtareas independientes) |
| `swarm` | plan → implement → review → commit | **Paralelo coordinado** (con dependencias) |
| `pipeline` | plan → implement → test → review → commit | **Etapas secuenciales** (transferencias entre etapas) |

```bash
orbit missions  # Listar todas
```

### 🎤 Modo Plan - Recopilación Interactiva de Requisitos

El comando `plan` realiza una entrevista de planificación interactiva para recopilar requisitos detallados antes de la ejecución:

```bash
# Recopilación de requisitos independiente
orbit plan "add shopping cart feature"

# Usar con cualquier misión mediante la bandera --plan
orbit launch --plan "add user authentication"
orbit warp --plan "refactor database layer"
```

**Cómo funciona:**
- **Preguntas generadas por IA**: Genera 5-7 preguntas de aclaración basadas en tu tarea
- **Entrevista interactiva**: Hace preguntas a través de la interacción con Copilot CLI
- **Síntesis inteligente**: Crea especificación de requisitos detallada a partir de las respuestas
- **Integración automática**: Los requisitos fluyen a los miembros del equipo durante la ejecución
- **Guarda especificación**: Almacena requisitos recopilados en `.copilot/state/plan_requirements.json`

**Perfecto para:**
- Funciones con requisitos poco claros o incompletos
- Tareas complejas que necesitan especificación detallada
- Recopilar criterios de aceptación antes de la implementación
- Garantizar alineación en el enfoque técnico

**Lo que se captura:**
- Requisitos detallados (descripción completa)
- Enfoque técnico (implementación recomendada)
- Criterios de aceptación (condiciones de éxito verificables)
- P&R de entrevista de usuario (para contexto)

### 🔄 Modo Ralph - Persistencia que Nunca se Rinde

La misión `ralph` es un modo de persistencia especial que no se rendirá hasta que la tarea esté verificada como completa:

```bash
orbit ralph "implement complex feature"
orbit ralph --max-attempts 15 "difficult refactor"
```

**Cómo funciona:**
- **Reintento automático**: Reintenta fases fallidas hasta 10 veces (configurable)
- **Escalamiento inteligente**: Escala nivel de modelo (fast → standard → premium) después de 2 intentos
- **Rotación de equipo**: Cambia miembro del equipo después de 4 intentos para nueva perspectiva
- **Variación de enfoque**: Intenta diferentes estrategias de implementación cada 3 intentos
- **Verificación**: Valida la finalización de cada fase antes de avanzar
- **Seguimiento de progreso**: Muestra recuento de intentos, nivel de escalamiento y errores

**Perfecto para:**
- Funciones complejas que pueden necesitar múltiples enfoques
- Errores difíciles que requieren persistencia
- Tareas donde quieres finalización garantizada
- Aprender de diferentes estrategias de implementación

### ⚡ Modos de Ejecución Paralela

ORBIT ofrece dos modos para ejecución de tareas paralelas:

#### 🚀 Modo Ultrawork - Tareas Paralelas Independientes

Distribuye subtareas independientes a través de sesiones concurrentes:

```bash
orbit ultrawork "refactor codebase with multiple independent modules"
orbit ultrawork --concurrency 6 "optimize performance across components"
```

**Cómo funciona:**
- Divide tarea en 3-8 subtareas independientes
- Ejecuta subtareas en lotes paralelos (respeta concurrencia máxima)
- Cada subtarea se ejecuta completamente independiente
- Mejor para tareas donde las subtareas no dependen entre sí

#### 🐝 Modo Swarm - Ejecución Paralela Coordinada

Distribución inteligente de tareas con conciencia de dependencias:

```bash
orbit swarm "implement user authentication system"
orbit swarm --concurrency 4 "build API with database and tests"
orbit swarm --no-coordination "simple parallel tasks"
```

**Cómo funciona:**
- Analiza tarea y crea gráfico de dependencias
- Ejecuta tareas en olas basadas en dependencias
- Las tareas dentro de una ola se ejecutan en paralelo
- Las tareas dependientes esperan que los requisitos previos se completen
- Comparte contexto entre tareas dependientes (coordinación)
- Detecta y previene bloqueos de dependencias

**Perfecto para:**
- Funciones complejas con dependencias de tareas naturales
- Sistemas multicomponente (backend + frontend + pruebas)
- Cuando el orden de las tareas importa pero algo de trabajo puede paralelizarse
- Máxima eficiencia con coordinación inteligente

**Ultrawork vs Swarm:**
- **Ultrawork**: Paralelización simple, todas las tareas independientes, planificación más rápida
- **Swarm**: Coordinación inteligente, respeta dependencias, mejor para trabajo complejo

#### 🔀 Modo Pipeline - Procesamiento Secuencial Multietapa

Ejecución secuencial con transferencias explícitas entre etapas:

```bash
orbit pipeline "implement data processing system"
orbit pipeline --premium "complex refactoring with multiple stages"
orbit pipeline --ecomode "step-by-step feature implementation"
```

**Cómo funciona:**
- Divide tarea en 3-7 etapas secuenciales
- Cada etapa se completa antes de que comience la siguiente
- Las etapas transfieren contexto a la siguiente etapa
- Diferentes equipos pueden manejar diferentes etapas
- Progresión clara desde configuración → implementación → pruebas → revisión
- Cada etapa recibe salida de la etapa anterior

**Perfecto para:**
- Funciones complejas que necesitan ejecución paso a paso
- Cuando el orden importa y las etapas se construyen entre sí
- Implementaciones multifase (configuración → núcleo → pruebas)
- Tareas intensivas en aprendizaje donde cada etapa informa la siguiente
- Separación clara de preocupaciones a través de etapas

**Pipeline vs Swarm vs Ultrawork:**
- **Pipeline**: Transferencias secuenciales, las etapas se construyen entre sí, progresión clara
- **Swarm**: Olas paralelas con dependencias, ejecución coordinada
- **Ultrawork**: Ejecución puramente paralela, todas las tareas independientes

## 🧠 Selección Inteligente de Modelos

Selección automática del modelo LLM óptimo por tarea para ahorrar tokens:

| Nivel | Icono | Costo | Caso de Uso |
|------|------|------|----------|
| `premium` | 🔥 | 3x | Arquitectura, seguridad, depuración compleja |
| `standard` | ⚡ | 1x | Desarrollo general, pruebas, revisiones |
| `fast` | 💨 | 0.5x | Docs, formateo, correcciones simples |
| `ecomode` | 🌱 | 0.6x | **Consciente del presupuesto** (ahorro 30-50%, usa mezcla fast/standard) |

```bash
orbit launch --premium "security audit"  # Forzar premium
orbit transmit --economy "update README" # Forzar fast
orbit launch --ecomode "add feature"     # Modo consciente del presupuesto
orbit fuel                               # Ver uso de tokens
```

**Ecomode:** Usa agresivamente modelos fast para revisiones, pruebas, planificación y docs, mientras mantiene standard para implementación y tareas críticas de seguridad. Perfecto para desarrollo consciente de costos.

Auto-escalamiento: Si una tarea falla con modelo standard, reintenta con premium.

## 🤖 Integración de Proveedores de IA

Validación cruzada opcional y comprobaciones de consistencia usando múltiples proveedores de IA:

```bash
# Configurar proveedores externos (opcional)
export GEMINI_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"

# Habilitar validación cruzada entre proveedores
orbit launch "implement payment API" --cross-validate

# Habilitar verificaciones de consistencia de diseño
orbit warp "add new component" --consistency-check

# Usar ambos para cambios críticos
orbit launch "security fix" --cross-validate --consistency-check --premium
```

**Características:**
- 🔍 **Validación cruzada**: Valida cambios a través de múltiples modelos de IA (Gemini, Codex, Claude)
- 📐 **Consistencia de diseño**: Verifica nuevo código contra patrones existentes
- 🎯 **Construcción de consenso**: Calcula tasas de acuerdo entre proveedores
- 🛡️ **Aseguramiento de calidad**: Captura problemas que una sola IA podría pasar por alto

**Cuándo usar:**
- Implementaciones críticas de seguridad
- Cambios arquitectónicos complejos
- Funciones listas para producción
- Proyectos de colaboración en equipo

Consulta [AI Provider Integration docs](./docs/AI_PROVIDER_INTEGRATION.md) para configuración y uso detallado.

## 📚 Mejores Prácticas

Todos los miembros del equipo referencian `.copilot/best-practices.yaml` para estándares:
- Estándares de codificación (TypeScript, Python, JavaScript)
- Patrones de prueba (arrange-act-assert, nombres)
- Directrices de seguridad (OWASP, validación de entrada)
- Convenciones de documentación
- Estándares de commit Git

## 🧑‍🚀 Tripulación (Agentes)

| Tripulación | Rol | Modelo |
|------|------|-------|
| `commander` | Arquitecto del sistema | 🔥 premium |
| `pilot` | Implementador | ⚡ standard |
| `engineer` | Detective de bugs | 🔥 premium |
| `navigator` | Revisor de código | ⚡ standard |
| `specialist` | Héroe QA | ⚡ standard |
| `security-officer` | Ninja de seguridad | 🔥 premium |
| `propulsion` | Rendimiento | ⚡ standard |
| `comms` | Documentación | 💨 fast |
| `ground-control` | DevOps | ⚡ standard |
| `mission-planner` | Planificador | ⚡ standard |
| `hal` | Automejora | ⚡ standard |

```bash
orbit crews
orbit launch --crew security-officer "add auth"
```

## 🧬 Bucle de Automejora

Orden de prioridad: **Cola → Issues de GitHub → Automejora**

```bash
orbit evolve              # Ejecutar hasta detener
orbit evolve --once       # Ciclo único
orbit evolve --turbo      # Modo rápido (30s de retraso)
orbit evolve --max 50     # Limitar ciclos
orbit status              # Mostrar historial
orbit reset               # Restablecer contadores de seguridad
```

### Cargo Manifest (Cola de Tareas)

```bash
# Agregar tareas
orbit cargo-add "Add user authentication" --priority high
orbit cargo-add "Add dark mode toggle"

# Ver cola
orbit cargo

# Procesar todas
orbit cargo-run
```

### Sistemas de Seguridad de Ground Control 🚨

Previene bucles infinitos:
- ✓ Máx 3 fallos consecutivos → enfriamiento
- ✓ Máx 5 ciclos sin progreso → abortar misión
- ✓ Detecta mejoras repetitivas → se requiere variedad
- ✓ Citas espaciales ("¡Houston, tenemos un problema!")

## 📋 Planificación de Implementación

Genera planes detallados e issues de GitHub:

```bash
# Crear un plan de vuelo para una función
orbit flight-plan new "Add OAuth2 authentication"

# Análisis más profundo
orbit flight-plan new "Refactor database layer" --depth 3

# Listar todos los planes
orbit flight-plan list

# Ver un plan específico
orbit flight-plan show plan-001

# Generar issues de GitHub desde un plan
orbit flight-plan issues plan-001
```

### Niveles de Profundidad del Plan

| Profundidad | Descripción |
|-------|-------------|
| 1 | Rápido: 3-5 tareas de alto nivel |
| 2 | Estándar: 8-12 tareas con decisiones (predeterminado) |
| 3 | Detallado: 15+ tareas, arquitectura, riesgos, pruebas |

## Archivos

```
orbit/
├── src/                 # Fuente TypeScript
│   ├── cli/             # Comandos CLI
│   ├── core/            # Tipos, detección, estado
│   ├── workflows/       # Control de misión, secuencia de lanzamiento, etc.
│   └── utils/           # Utilidades de salida, git, exec
├── dist/                # JavaScript compilado
├── .copilot/
│   ├── crew.yaml        # Definiciones de tripulación
│   ├── missions.yaml    # Definiciones de misión
│   ├── best-practices.yaml # Referencia de estándares
│   ├── models.yaml      # Configuración de selección de modelo
│   ├── cargo_manifest.txt # Cola de tareas
│   ├── config.sh        # Configuración legacy de shell
│   ├── plans/           # Planes de vuelo generados
│   └── state/           # Estado en tiempo de ejecución
├── package.json
├── tsconfig.json
├── QUICKSTART.md
└── README.md
```

## Desarrollo

```bash
# Modo desarrollo (usa tsx)
npm run dev -- launch "task"

# Construir TypeScript
npm run build

# Verificación de tipos
npm run typecheck

# Enlazar globalmente
npm link
```

## Licencia

MIT
