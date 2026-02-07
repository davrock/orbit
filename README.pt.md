[English](README.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Italiano](README.it.md) | [Español](README.es.md) | [Polski](README.pl.md) | [Português](README.pt.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [हिन्दी](README.hi.md)

# 🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit

Desenvolvimento de software autónomo impulsionado por IA com auto-melhoria, seleção inteligente de modelos e aplicação de melhores práticas.

> "Houston, temos descolagem!" 🚀

**Agora com TypeScript para maior fiabilidade e segurança de tipos!**

📚 **[Documentação Interativa](docs/index.html)** - Experimente comandos ORBIT no playground do navegador!

## Início Rápido

### Instalação

```bash
# Opção 1: npm (todas as plataformas)
npm install -g @davrock/orbit

# Opção 2: A partir do código fonte (Unix/macOS)
git clone https://github.com/davrock/orbit.git && cd orbit && ./install.sh

# Opção 3: A partir do código fonte (Windows PowerShell)
git clone https://github.com/davrock/orbit.git; cd orbit; .\install.ps1
```

### Utilização

```bash
# Workflow completo de funcionalidade
orbit launch "adicionar autenticação de utilizador"

# Correção de bug (usa modelos mais baratos)
orbit repair "corrigir crash de login"

# Ciclo de auto-melhoria (processa primeiro a fila)
orbit evolve

# Verificar configuração detetada
orbit config
```

## 🚀 Missões (Workflows)

| Missão | Fases | Caso de Uso |
|--------|-------|-------------|
| `launch` | plan → implement → test → review → commit | Novas funcionalidades |
| `repair` | debug → implement → test → commit | Correções de bugs |
| `warp` | implement → commit | Alterações rápidas |
| `mayday` | debug → implement → commit | Hotfixes |
| `preflight` | test → implement → test → review → commit | Workflow TDD |
| `shields-up` | plan → implement → security → test → review → commit | Crítico de segurança |
| `dock` | plan → implement → test → document → commit | Desenvolvimento de API |
| `transmit` | implement → review → commit | Documentação |
| `apollo` | todas as fases | Completo |
| `ralph` | implement → test → review → commit | **Modo persistente** (nunca desiste) |
| `plan` | interview → requirements | **Recolha de requisitos** (entrevista de planeamento) |
| `ultrawork` | plan → implement → review → commit | **Execução paralela** (sub-tarefas independentes) |
| `swarm` | plan → implement → review → commit | **Paralelo coordenado** (com dependências) |
| `pipeline` | plan → implement → test → review → commit | **Etapas sequenciais** (passagens entre etapas) |

```bash
orbit missions  # Listar todas
```

### 🎤 Modo Plan - Recolha Interativa de Requisitos

O comando `plan` conduz uma entrevista de planeamento interativa para recolher requisitos detalhados antes da execução:

```bash
# Recolha de requisitos autónoma
orbit plan "adicionar funcionalidade de carrinho"

# Usar com qualquer missão através da flag --plan
orbit launch --plan "adicionar autenticação de utilizador"
orbit warp --plan "refatorizar camada de base de dados"
```

**Como funciona:**
- **Perguntas geradas por IA**: Gera 5-7 perguntas de clarificação baseadas na sua tarefa
- **Entrevista interativa**: Faz perguntas através da interação Copilot CLI
- **Síntese inteligente**: Cria especificação detalhada de requisitos a partir das respostas
- **Integração automática**: Requisitos fluem para membros da equipa durante execução
- **Guarda especificação**: Armazena requisitos recolhidos em `.copilot/state/plan_requirements.json`

### 🔄 Modo Ralph - Persistência que Nunca Desiste

A missão `ralph` é um modo de persistência especial que não desiste até a tarefa ser verificada como completa:

```bash
orbit ralph "implementar funcionalidade complexa"
orbit ralph --max-attempts 15 "refatorização difícil"
```

**Como funciona:**
- **Repetição automática**: Repete fases falhadas até 10 vezes (configurável)
- **Escalação inteligente**: Escala nível do modelo (fast → standard → premium) após 2 tentativas
- **Rotação de equipa**: Muda membro da equipa após 4 tentativas para nova perspetiva
- **Variação de abordagem**: Tenta diferentes estratégias de implementação a cada 3 tentativas
- **Verificação**: Valida conclusão de cada fase antes de continuar

### ⚡ Modos de Execução Paralela

ORBIT oferece dois modos para execução paralela de tarefas:

#### 🚀 Modo Ultrawork - Tarefas Paralelas Independentes

Distribui sub-tarefas independentes por sessões concorrentes:

```bash
orbit ultrawork "refatorizar codebase com múltiplos módulos independentes"
orbit ultrawork --concurrency 6 "otimizar performance nos componentes"
```

#### 🐝 Modo Swarm - Execução Paralela Coordenada

Distribuição inteligente de tarefas com consciência de dependências:

```bash
orbit swarm "implementar sistema de autenticação de utilizador"
orbit swarm --concurrency 4 "construir API com base de dados e testes"
```

## 🧠 Seleção Inteligente de Modelo

Seleciona automaticamente o modelo LLM ideal por tarefa para poupar tokens:

| Nível | Ícone | Custo | Caso de Uso |
|-------|-------|-------|-------------|
| `premium` | 🔥 | 3x | Arquitetura, segurança, debugging complexo |
| `standard` | ⚡ | 1x | Desenvolvimento geral, testes, revisões |
| `fast` | 💨 | 0.5x | Docs, formatação, correções simples |
| `ecomode` | 🌱 | 0.6x | **Económico** (30-50% poupança) |

```bash
orbit launch --premium "auditoria de segurança"  # Forçar premium
orbit transmit --economy "atualizar README"      # Forçar fast
orbit launch --ecomode "adicionar funcionalidade" # Modo económico
orbit fuel                                        # Ver uso de tokens
```

## 🤖 Integração de Fornecedores IA

Validação cruzada opcional e verificações de consistência com múltiplos fornecedores IA:

```bash
# Configurar fornecedores externos (opcional)
export GEMINI_API_KEY="sua-chave"
export OPENAI_API_KEY="sua-chave"
export ANTHROPIC_API_KEY="sua-chave"

# Ativar validação cruzada entre fornecedores
orbit launch "implementar API de pagamento" --cross-validate
```

## 📚 Melhores Práticas

Todos os membros da equipa referenciam `.copilot/best-practices.yaml` para standards:
- Standards de codificação (TypeScript, Python, JavaScript)
- Padrões de teste (arrange-act-assert, nomenclatura)
- Diretrizes de segurança (OWASP, validação de entrada)
- Convenções de documentação
- Standards de commit Git

## 🧑‍🚀 Tripulação (Agentes)

| Tripulação | Função | Modelo |
|------------|--------|--------|
| `commander` | Arquiteto de sistema | 🔥 premium |
| `pilot` | Implementador | ⚡ standard |
| `engineer` | Detetive de bugs | 🔥 premium |
| `navigator` | Revisor de código | ⚡ standard |
| `specialist` | Herói QA | ⚡ standard |
| `security-officer` | Ninja de segurança | 🔥 premium |
| `propulsion` | Performance | ⚡ standard |
| `comms` | Documentação | 💨 fast |

```bash
orbit crews
orbit launch --crew security-officer "adicionar auth"
```

## 🧬 Ciclo de Auto-Melhoria

Ordem de prioridade: **Fila → GitHub Issues → Auto-Melhoria**

```bash
orbit evolve              # Executar até parar
orbit evolve --once       # Ciclo único
orbit evolve --turbo      # Modo rápido (30s delay)
orbit evolve --max 50     # Limitar ciclos
orbit status              # Mostrar histórico
orbit reset               # Resetar contadores failsafe
```

### Manifesto de Carga (Fila de Tarefas)

```bash
# Adicionar tarefas
orbit cargo-add "Adicionar autenticação de utilizador" --priority high
orbit cargo-add "Adicionar toggle modo escuro"

# Ver fila
orbit cargo

# Processar todas
orbit cargo-run
```

### Failsafes Ground Control 🚨

Previne loops infinitos:
- ✓ Máx 3 falhas consecutivas → pausa
- ✓ Máx 5 ciclos sem progresso → abortar missão
- ✓ Deteta melhorias repetitivas → variedade necessária
- ✓ Citações espaciais ("Houston, temos um problema!")

## 📋 Planeamento de Implementação

Gerar planos detalhados e issues GitHub:

```bash
# Criar um plano de voo para uma funcionalidade
orbit flight-plan new "Adicionar autenticação OAuth2"

# Análise mais profunda
orbit flight-plan new "Refatorizar camada de base de dados" --depth 3

# Listar todos os planos
orbit flight-plan list

# Gerar issues GitHub de um plano
orbit flight-plan issues plan-001
```

## Desenvolvimento

```bash
# Modo de desenvolvimento (usa tsx)
npm run dev -- launch "tarefa"

# Compilar TypeScript
npm run build

# Verificação de tipos
npm run typecheck

# Link global
npm link
```

## 💖 Apoiar e Contribuir

### Patrocinadores

Se ORBIT lhe poupa tempo e aumenta a sua produtividade, considere patrocinar:

- ⭐ **Dar estrela ao repo** - ajuda outros a descobrir ORBIT
- 💰 **GitHub Sponsors** - [Patrocinar @davrock](https://github.com/sponsors/davrock)
- ☕ **Oferecer-me um café** - Apoia o desenvolvimento contínuo

### Contribuir

Contribuições são bem-vindas! Veja como:

```bash
# Fork e clonar
git clone https://github.com/seu-username/orbit.git
cd orbit

# Instalar dependências
npm install

# Fazer alterações
npm run dev -- launch "sua melhoria"

# Build e testar
npm run build
npm run typecheck

# Submeter PR
git push origin feature/sua-melhoria
```

## Licença

MIT
