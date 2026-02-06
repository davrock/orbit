[English](README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | 日本語 | [Español](README.es.md)

# 🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit

自己改善、スマートモデル選択、ベストプラクティス適用を備えた AI 駆動の自律型ソフトウェア開発。

> "ヒューストン、発射成功！" 🚀

**より優れた信頼性と型安全性のために TypeScript で動作しています！**

## クイックスタート

### インストール

```bash
# オプション 1: npm（すべてのプラットフォーム）
npm install -g @davrock/orbit

# オプション 2: ソースからインストール（Unix/macOS）
git clone https://github.com/davrock/orbit.git && cd orbit && ./install.sh

# オプション 3: ソースからインストール（Windows PowerShell）
git clone https://github.com/davrock/orbit.git; cd orbit; .\install.ps1
```

### 使用方法

```bash
# フル機能ワークフロー
orbit launch "add user authentication"

# バグ修正（安価なモデルを使用）
orbit repair "fix login crash"

# 自己改善ループ（キューを優先処理）
orbit evolve

# 検出された設定を確認
orbit config
```

## 🚀 ミッション（ワークフロー）

| ミッション | フェーズ | ユースケース |
|---------|--------|----------|
| `launch` | plan → implement → test → review → commit | 新機能 |
| `repair` | debug → implement → test → commit | バグ修正 |
| `warp` | implement → commit | クイック変更 |
| `mayday` | debug → implement → commit | 緊急修正 |
| `preflight` | test → implement → test → review → commit | TDD ワークフロー |
| `shields-up` | plan → implement → security → test → review → commit | セキュリティ重視 |
| `dock` | plan → implement → test → document → commit | API 開発 |
| `transmit` | implement → review → commit | ドキュメント作成 |
| `apollo` | すべてのフェーズ | 包括的 |
| `ralph` | implement → test → review → commit | **永続モード**（決して諦めない） |
| `plan` | interview → requirements | **要件収集**（計画インタビュー） |
| `ultrawork` | plan → implement → review → commit | **並列実行**（独立したサブタスク） |
| `swarm` | plan → implement → review → commit | **協調並列**（依存関係あり） |
| `pipeline` | plan → implement → test → review → commit | **順次ステージ**（ステージ間の引き継ぎ） |

```bash
orbit missions  # すべてをリスト
```

### 🎤 Plan モード - インタラクティブな要件収集

`plan` コマンドは実行前に詳細な要件を収集するためのインタラクティブな計画インタビューを実施します：

```bash
# スタンドアロン要件収集
orbit plan "add shopping cart feature"

# --plan フラグで任意のミッションと一緒に使用
orbit launch --plan "add user authentication"
orbit warp --plan "refactor database layer"
```

**仕組み：**
- **AI 生成質問**：タスクに基づいて 5-7 個の明確化質問を生成
- **インタラクティブインタビュー**：Copilot CLI インタラクションを通じて質問
- **スマート統合**：回答から詳細な要件仕様を作成
- **自動統合**：実行中にクルーメンバーへ要件を伝達
- **仕様の保存**：収集した要件を `.copilot/state/plan_requirements.json` に保存

**最適な用途：**
- 不明確または不完全な要件を持つ機能
- 詳細な仕様が必要な複雑なタスク
- 実装前に受け入れ基準を収集
- 技術的アプローチの整合性を確保

**キャプチャされる内容：**
- 詳細要件（包括的な説明）
- 技術的アプローチ（推奨実装）
- 受け入れ基準（テスト可能な成功条件）
- ユーザーインタビュー Q&A（コンテキスト用）

### 🔄 Ralph モード - 決して諦めない永続性

`ralph` ミッションはタスクが検証完了するまで決して諦めない特別な永続モードです：

```bash
orbit ralph "implement complex feature"
orbit ralph --max-attempts 15 "difficult refactor"
```

**仕組み：**
- **自動リトライ**：失敗したフェーズを最大 10 回までリトライ（設定可能）
- **スマートエスカレーション**：2 回の試行後にモデルティアを昇格（fast → standard → premium）
- **クルー交代**：4 回の試行後に新しい視点のためクルーメンバーを切り替え
- **アプローチ変更**：3 回の試行ごとに異なる実装戦略を試行
- **検証**：次に進む前に各フェーズの完了を検証
- **進捗追跡**：試行回数、エスカレーションレベル、エラーを表示

**最適な用途：**
- 複数のアプローチが必要になる可能性のある複雑な機能
- 永続性が必要な難しいバグ
- 完了保証が必要なタスク
- 異なる実装戦略から学習

### ⚡ 並列実行モード

ORBIT は並列タスク実行のための 2 つのモードを提供します：

#### 🚀 Ultrawork モード - 独立した並列タスク

独立したサブタスクを同時セッションに分散：

```bash
orbit ultrawork "refactor codebase with multiple independent modules"
orbit ultrawork --concurrency 6 "optimize performance across components"
```

**仕組み：**
- タスクを 3-8 個の独立したサブタスクに分解
- サブタスクを並列バッチで実行（最大同時実行数を尊重）
- 各サブタスクは完全に独立して実行
- サブタスクが相互に依存しないタスクに最適

#### 🐝 Swarm モード - 協調並列実行

依存関係を認識したインテリジェントなタスク分散：

```bash
orbit swarm "implement user authentication system"
orbit swarm --concurrency 4 "build API with database and tests"
orbit swarm --no-coordination "simple parallel tasks"
```

**仕組み：**
- タスクを分析して依存関係グラフを作成
- 依存関係に基づいてウェーブでタスクを実行
- ウェーブ内のタスクは並列で実行
- 依存タスクは前提条件の完了を待機
- 依存タスク間でコンテキストを共有（協調）
- 依存関係デッドロックを検出して防止

**最適な用途：**
- 自然なタスク依存関係を持つ複雑な機能
- マルチコンポーネントシステム（バックエンド + フロントエンド + テスト）
- タスクの順序が重要だが一部の作業は並列化可能な場合
- インテリジェントな協調で最大効率

**Ultrawork vs Swarm：**
- **Ultrawork**：シンプルな並列化、すべてのタスクが独立、計画が速い
- **Swarm**：スマート協調、依存関係を尊重、複雑な作業に適している

#### 🔀 Pipeline モード - 順次マルチステージ処理

ステージ間の明示的な引き継ぎを持つ順次実行：

```bash
orbit pipeline "implement data processing system"
orbit pipeline --premium "complex refactoring with multiple stages"
orbit pipeline --ecomode "step-by-step feature implementation"
```

**仕組み：**
- タスクを 3-7 個の順次ステージに分解
- 各ステージは次のステージが始まる前に完了
- ステージは次のステージへコンテキストを引き継ぐ
- 異なるクルーが異なるステージを処理可能
- セットアップ → 実装 → テスト → レビューの明確な進行
- 各ステージは前のステージの出力を受け取る

**最適な用途：**
- ステップバイステップ実行が必要な複雑な機能
- 順序が重要でステージが相互に構築される場合
- マルチフェーズ実装（セットアップ → コア → テスト）
- 各ステージが次を知らせる学習集約型タスク
- ステージ全体での明確な関心事の分離

**Pipeline vs Swarm vs Ultrawork：**
- **Pipeline**：順次引き継ぎ、ステージが相互に構築、明確な進行
- **Swarm**：依存関係を持つ並列ウェーブ、協調実行
- **Ultrawork**：純粋な並列実行、すべてのタスクが独立

## 🧠 スマートモデル選択

タスクごとに最適な LLM モデルを自動選択してトークンを節約：

| ティア | アイコン | コスト | ユースケース |
|------|------|------|----------|
| `premium` | 🔥 | 3x | アーキテクチャ、セキュリティ、複雑なデバッグ |
| `standard` | ⚡ | 1x | 一般的な開発、テスト、レビュー |
| `fast` | 💨 | 0.5x | ドキュメント、フォーマット、簡単な修正 |
| `ecomode` | 🌱 | 0.6x | **予算重視**（30-50% 節約、fast/standard 混合使用） |

```bash
orbit launch --premium "security audit"  # premium を強制
orbit transmit --economy "update README" # fast を強制
orbit launch --ecomode "add feature"     # 予算重視モード
orbit fuel                               # トークン使用量を表示
```

**Ecomode：** レビュー、テスト、計画、ドキュメントには fast モデルを積極的に使用し、実装と重要なセキュリティタスクには standard を維持します。コスト重視の開発に最適です。

自動エスカレーション：standard モデルでタスクが失敗した場合、premium で再試行します。

## 🤖 AI プロバイダー統合

複数の AI プロバイダーを使用したオプションのクロス検証と一貫性チェック：

```bash
# 外部プロバイダーの設定（オプション）
export GEMINI_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"

# プロバイダー間のクロス検証を有効化
orbit launch "implement payment API" --cross-validate

# デザイン一貫性チェックを有効化
orbit warp "add new component" --consistency-check

# 重要な変更に対して両方を使用
orbit launch "security fix" --cross-validate --consistency-check --premium
```

**機能：**
- 🔍 **クロス検証**：複数の AI モデル（Gemini、Codex、Claude）で変更を検証
- 📐 **デザイン一貫性**：既存パターンに対して新しいコードをチェック
- 🎯 **コンセンサス構築**：プロバイダー間の合意率を計算
- 🛡️ **品質保証**：単一の AI が見逃す可能性のある問題をキャッチ

**使用タイミング：**
- セキュリティクリティカルな実装
- 複雑なアーキテクチャ変更
- プロダクション対応機能
- チームコラボレーションプロジェクト

詳細な設定と使用方法については [AI Provider Integration docs](./docs/AI_PROVIDER_INTEGRATION.md) を参照してください。

## 📚 ベストプラクティス

すべてのクルーメンバーは標準のために `.copilot/best-practices.yaml` を参照します：
- コーディング標準（TypeScript、Python、JavaScript）
- テストパターン（arrange-act-assert、命名）
- セキュリティガイドライン（OWASP、入力検証）
- ドキュメント規則
- Git コミット標準

## 🧑‍🚀 クルー（エージェント）

| クルー | 役割 | モデル |
|------|------|-------|
| `commander` | システムアーキテクト | 🔥 premium |
| `pilot` | 実装者 | ⚡ standard |
| `engineer` | バグ探偵 | 🔥 premium |
| `navigator` | コードレビュアー | ⚡ standard |
| `specialist` | QA ヒーロー | ⚡ standard |
| `security-officer` | セキュリティニンジャ | 🔥 premium |
| `propulsion` | パフォーマンス | ⚡ standard |
| `comms` | ドキュメント | 💨 fast |
| `ground-control` | DevOps | ⚡ standard |
| `mission-planner` | プランナー | ⚡ standard |
| `hal` | 自己改善 | ⚡ standard |

```bash
orbit crews
orbit launch --crew security-officer "add auth"
```

## 🧬 自己改善ループ

優先順位：**キュー → GitHub イシュー → 自己改善**

```bash
orbit evolve              # 停止するまで実行
orbit evolve --once       # 単一サイクル
orbit evolve --turbo      # 高速モード（30秒遅延）
orbit evolve --max 50     # サイクル制限
orbit status              # 履歴を表示
orbit reset               # フェイルセーフカウンターをリセット
```

### Cargo Manifest（タスクキュー）

```bash
# タスクを追加
orbit cargo-add "Add user authentication" --priority high
orbit cargo-add "Add dark mode toggle"

# キューを表示
orbit cargo

# すべて処理
orbit cargo-run
```

### Ground Control フェイルセーフ 🚨

無限ループを防止：
- ✓ 最大 3 回の連続失敗 → クールダウン
- ✓ 最大 5 回の進行なしサイクル → ミッション中止
- ✓ 反復的な改善を検出 → 多様性が必要
- ✓ 宇宙の名言（"ヒューストン、問題が発生しました！"）

## 📋 実装計画

詳細な計画と GitHub イシューの生成：

```bash
# 機能のフライトプランを作成
orbit flight-plan new "Add OAuth2 authentication"

# より深い分析
orbit flight-plan new "Refactor database layer" --depth 3

# すべての計画をリスト
orbit flight-plan list

# 特定の計画を表示
orbit flight-plan show plan-001

# 計画から GitHub イシューを生成
orbit flight-plan issues plan-001
```

### 計画の深度レベル

| 深度 | 説明 |
|-------|-------------|
| 1 | クイック：3-5 個の高レベルタスク |
| 2 | 標準：8-12 個のタスクと決定（デフォルト） |
| 3 | 詳細：15+ 個のタスク、アーキテクチャ、リスク、テスト |

## ファイル

```
orbit/
├── src/                 # TypeScript ソース
│   ├── cli/             # CLI コマンド
│   ├── core/            # タイプ、検出、状態
│   ├── workflows/       # ミッション制御、ローンチシーケンスなど
│   └── utils/           # 出力、git、exec ユーティリティ
├── dist/                # コンパイルされた JavaScript
├── .copilot/
│   ├── crew.yaml        # クルー定義
│   ├── missions.yaml    # ミッション定義
│   ├── best-practices.yaml # 標準リファレンス
│   ├── models.yaml      # モデル選択設定
│   ├── cargo_manifest.txt # タスクキュー
│   ├── config.sh        # レガシーシェル設定
│   ├── plans/           # 生成されたフライトプラン
│   └── state/           # ランタイム状態
├── package.json
├── tsconfig.json
├── QUICKSTART.md
└── README.md
```

## 開発

```bash
# 開発モード（tsx を使用）
npm run dev -- launch "task"

# TypeScript をビルド
npm run build

# 型チェック
npm run typecheck

# グローバルリンク
npm link
```

## ライセンス

MIT
