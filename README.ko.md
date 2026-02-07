[English](README.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Italiano](README.it.md) | [Español](README.es.md) | [Polski](README.pl.md) | [Português](README.pt.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md)

# 🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit

자기 개선, 스마트 모델 선택 및 모범 사례 적용을 갖춘 AI 기반 자율 소프트웨어 개발.

> "휴스턴, 발사 성공!" 🚀

**더 나은 안정성과 타입 안전성을 위해 TypeScript로 구동됩니다!**

## 빠른 시작

### 설치

```bash
# 옵션 1: npm (모든 플랫폼)
npm install -g @davrock/orbit

# 옵션 2: 소스에서 설치 (Unix/macOS)
git clone https://github.com/davrock/orbit.git && cd orbit && ./install.sh

# 옵션 3: 소스에서 설치 (Windows PowerShell)
git clone https://github.com/davrock/orbit.git; cd orbit; .\install.ps1
```

### 사용법

```bash
# 전체 기능 워크플로우
orbit launch "add user authentication"

# 버그 수정 (저렴한 모델 사용)
orbit repair "fix login crash"

# 자기 개선 루프 (큐 우선 처리)
orbit evolve

# 감지된 설정 확인
orbit config
```

## 🚀 미션 (워크플로우)

| 미션 | 단계 | 사용 사례 |
|---------|--------|----------|
| `launch` | plan → implement → test → review → commit | 새로운 기능 |
| `repair` | debug → implement → test → commit | 버그 수정 |
| `warp` | implement → commit | 빠른 변경 |
| `mayday` | debug → implement → commit | 긴급 수정 |
| `preflight` | test → implement → test → review → commit | TDD 워크플로우 |
| `shields-up` | plan → implement → security → test → review → commit | 보안 민감 작업 |
| `dock` | plan → implement → test → document → commit | API 개발 |
| `transmit` | implement → review → commit | 문서화 |
| `apollo` | 모든 단계 | 종합적 |
| `ralph` | implement → test → review → commit | **지속 모드** (절대 포기하지 않음) |
| `plan` | interview → requirements | **요구사항 수집** (계획 인터뷰) |
| `ultrawork` | plan → implement → review → commit | **병렬 실행** (독립적인 하위 작업) |
| `swarm` | plan → implement → review → commit | **협조된 병렬** (종속성 포함) |
| `pipeline` | plan → implement → test → review → commit | **순차적 단계** (단계 간 전달) |

```bash
orbit missions  # 모두 나열
```

### 🎤 Plan 모드 - 대화형 요구사항 수집

`plan` 명령은 실행 전에 상세한 요구사항을 수집하기 위한 대화형 계획 인터뷰를 수행합니다:

```bash
# 독립적인 요구사항 수집
orbit plan "add shopping cart feature"

# --plan 플래그로 모든 미션에서 사용
orbit launch --plan "add user authentication"
orbit warp --plan "refactor database layer"
```

**작동 방식:**
- **AI 생성 질문**: 작업을 기반으로 5-7개의 명확화 질문 생성
- **대화형 인터뷰**: Copilot CLI 상호작용을 통해 질문
- **스마트 종합**: 답변에서 상세한 요구사항 명세서 생성
- **자동 통합**: 실행 중 크루 멤버에게 요구사항 전달
- **명세서 저장**: 수집된 요구사항을 `.copilot/state/plan_requirements.json`에 저장

**완벽한 용도:**
- 불명확하거나 불완전한 요구사항이 있는 기능
- 상세한 명세가 필요한 복잡한 작업
- 구현 전 수락 기준 수집
- 기술적 접근 방식에 대한 정렬 보장

**캡처되는 내용:**
- 상세 요구사항 (종합적 설명)
- 기술적 접근 방식 (권장 구현)
- 수락 기준 (테스트 가능한 성공 조건)
- 사용자 인터뷰 Q&A (컨텍스트용)

### 🔄 Ralph 모드 - 절대 포기하지 않는 지속성

`ralph` 미션은 작업이 검증될 때까지 절대 포기하지 않는 특별한 지속 모드입니다:

```bash
orbit ralph "implement complex feature"
orbit ralph --max-attempts 15 "difficult refactor"
```

**작동 방식:**
- **자동 재시도**: 실패한 단계를 최대 10회까지 재시도 (설정 가능)
- **스마트 에스컬레이션**: 2회 시도 후 모델 티어 상승 (fast → standard → premium)
- **크루 교체**: 4회 시도 후 새로운 관점을 위해 크루 멤버 교체
- **접근 방식 변경**: 3회 시도마다 다른 구현 전략 시도
- **검증**: 다음 단계로 진행하기 전에 각 단계 완료 검증
- **진행 추적**: 시도 횟수, 에스컬레이션 레벨 및 오류 표시

**완벽한 용도:**
- 여러 접근 방식이 필요할 수 있는 복잡한 기능
- 지속성이 필요한 어려운 버그
- 완료 보장을 원하는 작업
- 다양한 구현 전략에서 학습

### ⚡ 병렬 실행 모드

ORBIT은 병렬 작업 실행을 위한 두 가지 모드를 제공합니다:

#### 🚀 Ultrawork 모드 - 독립적인 병렬 작업

독립적인 하위 작업을 동시 세션에 분산:

```bash
orbit ultrawork "refactor codebase with multiple independent modules"
orbit ultrawork --concurrency 6 "optimize performance across components"
```

**작동 방식:**
- 작업을 3-8개의 독립적인 하위 작업으로 분할
- 하위 작업을 병렬 배치로 실행 (최대 동시성 존중)
- 각 하위 작업은 완전히 독립적으로 실행
- 하위 작업이 서로 의존하지 않는 작업에 최적

#### 🐝 Swarm 모드 - 협조된 병렬 실행

종속성 인식을 갖춘 지능형 작업 분산:

```bash
orbit swarm "implement user authentication system"
orbit swarm --concurrency 4 "build API with database and tests"
orbit swarm --no-coordination "simple parallel tasks"
```

**작동 방식:**
- 작업을 분석하고 종속성 그래프 생성
- 종속성에 따라 웨이브로 작업 실행
- 웨이브 내의 작업은 병렬로 실행
- 종속 작업은 전제 조건 완료 대기
- 종속 작업 간 컨텍스트 공유 (협조)
- 종속성 데드락 감지 및 방지

**완벽한 용도:**
- 자연스러운 작업 종속성이 있는 복잡한 기능
- 다중 컴포넌트 시스템 (백엔드 + 프론트엔드 + 테스트)
- 작업 순서가 중요하지만 일부 작업은 병렬화 가능한 경우
- 지능형 협조로 최대 효율성

**Ultrawork vs Swarm:**
- **Ultrawork**: 간단한 병렬화, 모든 작업 독립적, 빠른 계획
- **Swarm**: 스마트 협조, 종속성 존중, 복잡한 작업에 더 좋음

#### 🔀 Pipeline 모드 - 순차적 다단계 처리

단계 간 명시적 전달을 갖춘 순차적 실행:

```bash
orbit pipeline "implement data processing system"
orbit pipeline --premium "complex refactoring with multiple stages"
orbit pipeline --ecomode "step-by-step feature implementation"
```

**작동 방식:**
- 작업을 3-7개의 순차적 단계로 분할
- 각 단계는 다음 단계가 시작되기 전에 완료
- 단계는 다음 단계로 컨텍스트 전달
- 서로 다른 크루가 서로 다른 단계 처리 가능
- 설정 → 구현 → 테스팅 → 리뷰의 명확한 진행
- 각 단계는 이전 단계의 출력 수신

**완벽한 용도:**
- 단계별 실행이 필요한 복잡한 기능
- 순서가 중요하고 단계가 서로 기반으로 구축되는 경우
- 다단계 구현 (설정 → 핵심 → 테스팅)
- 각 단계가 다음 단계를 알려주는 학습 집약적 작업
- 단계 전반에 걸친 명확한 관심사 분리

**Pipeline vs Swarm vs Ultrawork:**
- **Pipeline**: 순차적 전달, 단계가 서로 기반으로 구축, 명확한 진행
- **Swarm**: 종속성이 있는 병렬 웨이브, 협조된 실행
- **Ultrawork**: 순수 병렬 실행, 모든 작업 독립적

## 🧠 스마트 모델 선택

작업별로 최적의 LLM 모델을 자동 선택하여 토큰 절약:

| 티어 | 아이콘 | 비용 | 사용 사례 |
|------|------|------|----------|
| `premium` | 🔥 | 3x | 아키텍처, 보안, 복잡한 디버깅 |
| `standard` | ⚡ | 1x | 일반 개발, 테스트, 리뷰 |
| `fast` | 💨 | 0.5x | 문서, 포맷팅, 간단한 수정 |
| `ecomode` | 🌱 | 0.6x | **예산 절약** (30-50% 절감, fast/standard 혼합 사용) |

```bash
orbit launch --premium "security audit"  # premium 강제
orbit transmit --economy "update README" # fast 강제
orbit launch --ecomode "add feature"     # 예산 절약 모드
orbit fuel                               # 토큰 사용량 보기
```

**Ecomode:** 리뷰, 테스트, 계획 및 문서에 fast 모델을 적극적으로 사용하고, 구현 및 중요한 보안 작업에는 standard를 유지합니다. 비용을 고려한 개발에 완벽합니다.

자동 에스컬레이션: standard 모델로 작업이 실패하면 premium으로 재시도합니다.

## 🤖 AI 제공자 통합

여러 AI 제공자를 사용한 선택적 교차 검증 및 일관성 검사:

```bash
# 외부 제공자 설정 (선택 사항)
export GEMINI_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"

# 제공자 간 교차 검증 활성화
orbit launch "implement payment API" --cross-validate

# 디자인 일관성 검사 활성화
orbit warp "add new component" --consistency-check

# 중요한 변경 사항에 대해 두 가지 모두 사용
orbit launch "security fix" --cross-validate --consistency-check --premium
```

**기능:**
- 🔍 **교차 검증**: 여러 AI 모델(Gemini, Codex, Claude)에서 변경 사항 검증
- 📐 **디자인 일관성**: 기존 패턴에 대해 새 코드 확인
- 🎯 **합의 구축**: 제공자 간 동의율 계산
- 🛡️ **품질 보증**: 단일 AI가 놓칠 수 있는 문제 포착

**사용 시기:**
- 보안 중요 구현
- 복잡한 아키텍처 변경
- 프로덕션 준비 기능
- 팀 협업 프로젝트

자세한 구성 및 사용법은 [AI Provider Integration docs](./docs/AI_PROVIDER_INTEGRATION.md)를 참조하세요.

## 📚 모범 사례

모든 크루 멤버는 표준을 위해 `.copilot/best-practices.yaml`을 참조합니다:
- 코딩 표준 (TypeScript, Python, JavaScript)
- 테스팅 패턴 (arrange-act-assert, 명명)
- 보안 가이드라인 (OWASP, 입력 검증)
- 문서화 규칙
- Git 커밋 표준

## 🧑‍🚀 크루 (에이전트)

| 크루 | 역할 | 모델 |
|------|------|-------|
| `commander` | 시스템 아키텍트 | 🔥 premium |
| `pilot` | 구현자 | ⚡ standard |
| `engineer` | 버그 탐정 | 🔥 premium |
| `navigator` | 코드 리뷰어 | ⚡ standard |
| `specialist` | QA 히어로 | ⚡ standard |
| `security-officer` | 보안 닌자 | 🔥 premium |
| `propulsion` | 성능 | ⚡ standard |
| `comms` | 문서화 | 💨 fast |
| `ground-control` | DevOps | ⚡ standard |
| `mission-planner` | 계획자 | ⚡ standard |
| `hal` | 자기 개선 | ⚡ standard |

```bash
orbit crews
orbit launch --crew security-officer "add auth"
```

## 🧬 자기 개선 루프

우선순위: **큐 → GitHub 이슈 → 자기 개선**

```bash
orbit evolve              # 중지될 때까지 실행
orbit evolve --once       # 단일 사이클
orbit evolve --turbo      # 빠른 모드 (30초 지연)
orbit evolve --max 50     # 사이클 제한
orbit status              # 히스토리 표시
orbit reset               # 페일세이프 카운터 리셋
```

### Cargo Manifest (작업 큐)

```bash
# 작업 추가
orbit cargo-add "Add user authentication" --priority high
orbit cargo-add "Add dark mode toggle"

# 큐 보기
orbit cargo

# 모두 처리
orbit cargo-run
```

### Ground Control 페일세이프 🚨

무한 루프 방지:
- ✓ 최대 3회 연속 실패 → 쿨다운
- ✓ 최대 5회 진행 없음 사이클 → 미션 중단
- ✓ 반복적인 개선 감지 → 다양성 필요
- ✓ 우주 명언 ("휴스턴, 문제가 발생했습니다!")

## 📋 구현 계획

상세한 계획 및 GitHub 이슈 생성:

```bash
# 기능에 대한 비행 계획 생성
orbit flight-plan new "Add OAuth2 authentication"

# 더 깊은 분석
orbit flight-plan new "Refactor database layer" --depth 3

# 모든 계획 나열
orbit flight-plan list

# 특정 계획 보기
orbit flight-plan show plan-001

# 계획에서 GitHub 이슈 생성
orbit flight-plan issues plan-001
```

### 계획 깊이 레벨

| 깊이 | 설명 |
|-------|-------------|
| 1 | 빠름: 3-5개의 높은 수준 작업 |
| 2 | 표준: 8-12개의 작업 및 결정 (기본값) |
| 3 | 상세: 15개 이상의 작업, 아키텍처, 위험, 테스팅 |

## 파일

```
orbit/
├── src/                 # TypeScript 소스
│   ├── cli/             # CLI 명령
│   ├── core/            # 타입, 감지, 상태
│   ├── workflows/       # 미션 제어, 발사 시퀀스 등
│   └── utils/           # 출력, git, exec 유틸리티
├── dist/                # 컴파일된 JavaScript
├── .copilot/
│   ├── crew.yaml        # 크루 정의
│   ├── missions.yaml    # 미션 정의
│   ├── best-practices.yaml # 표준 참조
│   ├── models.yaml      # 모델 선택 설정
│   ├── cargo_manifest.txt # 작업 큐
│   ├── config.sh        # 레거시 셸 설정
│   ├── plans/           # 생성된 비행 계획
│   └── state/           # 런타임 상태
├── package.json
├── tsconfig.json
├── QUICKSTART.md
└── README.md
```

## 개발

```bash
# 개발 모드 (tsx 사용)
npm run dev -- launch "task"

# TypeScript 빌드
npm run build

# 타입 체크
npm run typecheck

# 전역 링크
npm link
```

## 라이선스

MIT
