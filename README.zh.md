[English](README.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Italiano](README.it.md) | [Español](README.es.md) | [Polski](README.pl.md) | [Português](README.pt.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md)

# 🛸 ORBIT - 编排式机器人构建与集成工具包

具有自我改进、智能模型选择和最佳实践执行的 AI 驱动自主软件开发。

> "休斯顿，我们升空了！" 🚀

**现在由 TypeScript 驱动，提供更好的可靠性和类型安全性！**

## 快速开始

### 安装

```bash
# 选项 1: npm (任何平台)
npm install -g @davrock/orbit

# 选项 2: 从源码安装 (Unix/macOS)
git clone https://github.com/davrock/orbit.git && cd orbit && ./install.sh

# 选项 3: 从源码安装 (Windows PowerShell)
git clone https://github.com/davrock/orbit.git; cd orbit; .\install.ps1
```

### 使用

```bash
# 完整功能工作流
orbit launch "add user authentication"

# 错误修复（使用更便宜的模型）
orbit repair "fix login crash"

# 自我改进循环（优先处理队列）
orbit evolve

# 检查检测到的配置
orbit config
```

## 🚀 任务（工作流）

| 任务 | 阶段 | 用例 |
|---------|--------|----------|
| `launch` | plan → implement → test → review → commit | 新功能 |
| `repair` | debug → implement → test → commit | 错误修复 |
| `warp` | implement → commit | 快速更改 |
| `mayday` | debug → implement → commit | 紧急修复 |
| `preflight` | test → implement → test → review → commit | TDD 工作流 |
| `shields-up` | plan → implement → security → test → review → commit | 安全敏感 |
| `dock` | plan → implement → test → document → commit | API 开发 |
| `transmit` | implement → review → commit | 文档编写 |
| `apollo` | 所有阶段 | 综合性 |
| `ralph` | implement → test → review → commit | **持久模式**（永不放弃） |
| `plan` | interview → requirements | **需求收集**（规划访谈） |
| `ultrawork` | plan → implement → review → commit | **并行执行**（独立子任务） |
| `swarm` | plan → implement → review → commit | **协调并行**（带依赖关系） |
| `pipeline` | plan → implement → test → review → commit | **顺序阶段**（阶段间传递） |

```bash
orbit missions  # 列出所有
```

### 🎤 Plan 模式 - 交互式需求收集

`plan` 命令在执行前进行交互式规划访谈以收集详细需求：

```bash
# 独立需求收集
orbit plan "add shopping cart feature"

# 通过 --plan 标志与任何任务一起使用
orbit launch --plan "add user authentication"
orbit warp --plan "refactor database layer"
```

**工作原理：**
- **AI 生成问题**：基于您的任务生成 5-7 个澄清问题
- **交互式访谈**：通过 Copilot CLI 交互提问
- **智能综合**：从答案创建详细的需求规范
- **自动集成**：在执行期间将需求传递给团队成员
- **保存规范**：将收集的需求存储在 `.copilot/state/plan_requirements.json`

**完美适用于：**
- 需求不明确或不完整的功能
- 需要详细规范的复杂任务
- 在实施前收集验收标准
- 确保技术方法一致

**捕获的内容：**
- 详细需求（全面描述）
- 技术方法（推荐实施）
- 验收标准（可测试的成功条件）
- 用户访谈问答（用于上下文）

### 🔄 Ralph 模式 - 永不放弃的持久性

`ralph` 任务是一种特殊的持久模式，在任务验证完成之前不会放弃：

```bash
orbit ralph "implement complex feature"
orbit ralph --max-attempts 15 "difficult refactor"
```

**工作原理：**
- **自动重试**：失败的阶段最多重试 10 次（可配置）
- **智能升级**：2 次尝试后升级模型层级（fast → standard → premium）
- **团队轮换**：4 次尝试后切换团队成员以获得新视角
- **方法变化**：每 3 次尝试尝试不同的实施策略
- **验证**：在继续前验证每个阶段的完成
- **进度跟踪**：显示尝试次数、升级级别和错误

**完美适用于：**
- 可能需要多种方法的复杂功能
- 需要持久性的困难错误
- 希望保证完成的任务
- 从不同实施策略中学习

### ⚡ 并行执行模式

ORBIT 提供两种并行任务执行模式：

#### 🚀 Ultrawork 模式 - 独立并行任务

在并发会话中分配独立子任务：

```bash
orbit ultrawork "refactor codebase with multiple independent modules"
orbit ultrawork --concurrency 6 "optimize performance across components"
```

**工作原理：**
- 将任务分解为 3-8 个独立子任务
- 在并行批次中执行子任务（尊重最大并发）
- 每个子任务完全独立运行
- 最适合子任务不相互依赖的任务

#### 🐝 Swarm 模式 - 协调并行执行

具有依赖关系意识的智能任务分配：

```bash
orbit swarm "implement user authentication system"
orbit swarm --concurrency 4 "build API with database and tests"
orbit swarm --no-coordination "simple parallel tasks"
```

**工作原理：**
- 分析任务并创建依赖关系图
- 根据依赖关系按波次执行任务
- 波次内的任务并行运行
- 依赖任务等待前提条件完成
- 在依赖任务之间共享上下文（协调）
- 检测并防止依赖死锁

**完美适用于：**
- 具有自然任务依赖关系的复杂功能
- 多组件系统（后端 + 前端 + 测试）
- 任务顺序重要但某些工作可以并行化时
- 通过智能协调实现最大效率

**Ultrawork vs Swarm：**
- **Ultrawork**：简单并行化，所有任务独立，规划更快
- **Swarm**：智能协调，尊重依赖关系，更适合复杂工作

#### 🔀 Pipeline 模式 - 顺序多阶段处理

阶段间明确交接的顺序执行：

```bash
orbit pipeline "implement data processing system"
orbit pipeline --premium "complex refactoring with multiple stages"
orbit pipeline --ecomode "step-by-step feature implementation"
```

**工作原理：**
- 将任务分解为 3-7 个顺序阶段
- 每个阶段在下一个开始前完成
- 阶段将上下文传递给下一个阶段
- 不同的团队可以处理不同的阶段
- 从设置 → 实施 → 测试 → 审查的清晰进展
- 每个阶段接收前一阶段的输出

**完美适用于：**
- 需要逐步执行的复杂功能
- 顺序重要且阶段相互构建时
- 多阶段实施（设置 → 核心 → 测试）
- 学习密集型任务，每个阶段为下一个阶段提供信息
- 跨阶段关注点的清晰分离

**Pipeline vs Swarm vs Ultrawork：**
- **Pipeline**：顺序交接，阶段相互构建，清晰进展
- **Swarm**：带依赖关系的并行波次，协调执行
- **Ultrawork**：纯并行执行，所有任务独立

## 🧠 智能模型选择

自动为每个任务选择最佳 LLM 模型以节省令牌：

| 层级 | 图标 | 成本 | 用例 |
|------|------|------|----------|
| `premium` | 🔥 | 3x | 架构、安全、复杂调试 |
| `standard` | ⚡ | 1x | 一般开发、测试、审查 |
| `fast` | 💨 | 0.5x | 文档、格式化、简单修复 |
| `ecomode` | 🌱 | 0.6x | **预算意识**（30-50% 节省，使用 fast/standard 混合） |

```bash
orbit launch --premium "security audit"  # 强制 premium
orbit transmit --economy "update README" # 强制 fast
orbit launch --ecomode "add feature"     # 预算意识模式
orbit fuel                               # 查看令牌使用量
```

**Ecomode：** 积极使用 fast 模型进行审查、测试、规划和文档，同时为实施和关键安全任务保留 standard。非常适合成本意识的开发。

自动升级：如果任务使用 standard 模型失败，则使用 premium 重试。

## 🤖 AI 提供商集成

使用多个 AI 提供商的可选交叉验证和一致性检查：

```bash
# 设置外部提供商（可选）
export GEMINI_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"

# 启用跨提供商交叉验证
orbit launch "implement payment API" --cross-validate

# 启用设计一致性检查
orbit warp "add new component" --consistency-check

# 对关键更改使用两者
orbit launch "security fix" --cross-validate --consistency-check --premium
```

**功能：**
- 🔍 **交叉验证**：跨多个 AI 模型（Gemini、Codex、Claude）验证更改
- 📐 **设计一致性**：根据现有模式检查新代码
- 🎯 **共识构建**：计算提供商之间的一致率
- 🛡️ **质量保证**：捕获单个 AI 可能遗漏的问题

**何时使用：**
- 安全关键实施
- 复杂的架构更改
- 生产就绪功能
- 团队协作项目

有关详细配置和使用，请参见 [AI Provider Integration docs](./docs/AI_PROVIDER_INTEGRATION.md)。

## 📚 最佳实践

所有团队成员参考 `.copilot/best-practices.yaml` 获取标准：
- 编码标准（TypeScript、Python、JavaScript）
- 测试模式（arrange-act-assert、命名）
- 安全指南（OWASP、输入验证）
- 文档约定
- Git 提交标准

## 🧑‍🚀 团队（代理）

| 团队 | 角色 | 模型 |
|------|------|-------|
| `commander` | 系统架构师 | 🔥 premium |
| `pilot` | 实施者 | ⚡ standard |
| `engineer` | Bug 侦探 | 🔥 premium |
| `navigator` | 代码审查员 | ⚡ standard |
| `specialist` | QA 英雄 | ⚡ standard |
| `security-officer` | 安全忍者 | 🔥 premium |
| `propulsion` | 性能 | ⚡ standard |
| `comms` | 文档 | 💨 fast |
| `ground-control` | DevOps | ⚡ standard |
| `mission-planner` | 规划者 | ⚡ standard |
| `hal` | 自我改进 | ⚡ standard |

```bash
orbit crews
orbit launch --crew security-officer "add auth"
```

## 🧬 自我改进循环

优先顺序：**队列 → GitHub 问题 → 自我改进**

```bash
orbit evolve              # 运行直到停止
orbit evolve --once       # 单次循环
orbit evolve --turbo      # 快速模式（30秒延迟）
orbit evolve --max 50     # 限制循环
orbit status              # 显示历史
orbit reset               # 重置故障保护计数器
```

### Cargo Manifest（任务队列）

```bash
# 添加任务
orbit cargo-add "Add user authentication" --priority high
orbit cargo-add "Add dark mode toggle"

# 查看队列
orbit cargo

# 处理所有
orbit cargo-run
```

### Ground Control 故障保护 🚨

防止无限循环：
- ✓ 最多 3 次连续失败 → 冷却
- ✓ 最多 5 次无进展循环 → 中止任务
- ✓ 检测重复改进 → 需要多样性
- ✓ 太空名言（"休斯顿，我们有麻烦了！"）

## 📋 实施规划

生成详细计划和 GitHub 问题：

```bash
# 为功能创建飞行计划
orbit flight-plan new "Add OAuth2 authentication"

# 更深入的分析
orbit flight-plan new "Refactor database layer" --depth 3

# 列出所有计划
orbit flight-plan list

# 查看特定计划
orbit flight-plan show plan-001

# 从计划生成 GitHub 问题
orbit flight-plan issues plan-001
```

### 计划深度级别

| 深度 | 描述 |
|-------|-------------|
| 1 | 快速：3-5 个高级任务 |
| 2 | 标准：8-12 个任务和决策（默认） |
| 3 | 详细：15+ 个任务、架构、风险、测试 |

## 文件

```
orbit/
├── src/                 # TypeScript 源码
│   ├── cli/             # CLI 命令
│   ├── core/            # 类型、检测、状态
│   ├── workflows/       # 任务控制、发射序列等
│   └── utils/           # 输出、git、exec 工具
├── dist/                # 编译的 JavaScript
├── .copilot/
│   ├── crew.yaml        # 团队定义
│   ├── missions.yaml    # 任务定义
│   ├── best-practices.yaml # 标准参考
│   ├── models.yaml      # 模型选择配置
│   ├── cargo_manifest.txt # 任务队列
│   ├── config.sh        # 旧版 shell 配置
│   ├── plans/           # 生成的飞行计划
│   └── state/           # 运行时状态
├── package.json
├── tsconfig.json
├── QUICKSTART.md
└── README.md
```

## 开发

```bash
# 开发模式（使用 tsx）
npm run dev -- launch "task"

# 构建 TypeScript
npm run build

# 类型检查
npm run typecheck

# 全局链接
npm link
```

## 许可证

MIT
