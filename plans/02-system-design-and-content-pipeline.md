# 시스템 구조와 콘텐츠 생성 흐름

## 1. 전체 구조

이 프로젝트는 크게 5개 영역으로 나뉜다.

### 1. 원본 노트 영역

- 위치: 현재는 `obsidian/Datascience`, 장기적으로는 `obsidian/*`
- 역할: Obsidian에서 작성한 실제 원본 Markdown 보관

여기에는 작성자가 직접 쓴 노트와 이미지가 들어 있다.
이 파일들은 웹사이트에 바로 쓰기 위한 형식이 아니라, 작성용 원본이다.

현재 구현은 `Datascience`를 기준으로 먼저 시작했지만, 계획 차원에서는 아래 두 확장을 반드시 고려해야 한다.

- `obsidian` 아래에 `Datascience` 외 여러 최상위 폴더가 생기는 경우
- 각 최상위 폴더 아래에 `RL/Actor-Critic`처럼 더 깊은 중첩 폴더가 생기는 경우

### 2. 사이트 설정 영역

- 위치: `site.config.ts`
- 역할: 사이트 운영에 필요한 변경 가능 값 보관

여기에는 다음 같은 값이 들어 있다.

- 사이트 제목
- 표시 이름
- 소개 문구
- GitHub / LinkedIn / Email 링크
- 카테고리 설명
- 노트 정렬 순서

즉, “사이트 내용의 핵심 설정판” 역할을 한다.

### 3. 콘텐츠 생성 영역

- 위치: `scripts/generate-content.ts`
- 역할: 원본 노트를 Quartz 입력 형태로 변환

이 스크립트가 사실상 프로젝트의 핵심이다.

이 파일은 아래 일을 한다.

- 원본 Markdown 목록 확인
- 설정 파일의 노트 목록과 실제 원본 파일 목록이 일치하는지 검증
- 이미지 자산 수집
- `content/` 폴더 재생성
- 홈 페이지 생성
- 카테고리 페이지 생성
- 개별 노트에 frontmatter 추가
- Obsidian 위키링크를 일반 Markdown 링크로 변환
- Obsidian 이미지 임베드를 일반 이미지 링크로 변환

향후 구조 확장을 기준으로 보면, 이 영역은 단순한 “Datascience 변환기”가 아니라 아래 역할까지 맡아야 한다.

- `obsidian` 아래 여러 최상위 섹션을 스캔
- 폴더 깊이에 따라 경로를 재귀적으로 처리
- 중간 폴더마다 설명 페이지 또는 인덱스 페이지를 만들 수 있게 준비
- 더 깊은 경로에서도 내부 링크를 올바르게 계산

### 4. Quartz 렌더링 영역

- `quartz.config.ts`
- `quartz.layout.ts`
- `quartz.custom.ts`
- `quartz/styles/custom.scss`

이 영역은 생성된 `content/` 파일을 실제 웹사이트 화면으로 만드는 부분이다.

### 5. 배포 영역

- `.github/workflows/deploy.yml`

이 파일은 `main` 브랜치에 푸시가 들어오면 사이트를 빌드하고 GitHub Pages에 배포한다.

## 2. 데이터 흐름

이 프로젝트의 데이터 흐름은 아래처럼 생각하면 쉽다.

`obsidian 원본` -> `변환 스크립트` -> `content 생성물` -> `Quartz 빌드` -> `public 정적 사이트` -> `GitHub Pages`

조금 더 자세히 쓰면 다음 순서다.

1. 사용자가 현재는 `obsidian/Datascience` 아래에서, 장기적으로는 `obsidian` 하위 여러 섹션에서 노트를 작성한다.
2. `npm run generate:content`를 실행한다.
3. 스크립트가 `content/` 아래에 Quartz용 파일을 생성한다.
4. `npm run build`를 실행한다.
5. Quartz가 `content/`를 읽어 `public/` 정적 파일을 만든다.
6. GitHub Actions가 `public/`을 GitHub Pages에 배포한다.

## 3. 왜 `content/`를 직접 편집하지 않는가

`content/`는 사람이 직접 작성하는 폴더가 아니라 “생성 결과물”에 가깝다.

그 이유는 다음과 같다.

- 원본 진실의 원천은 `obsidian/`여야 한다.
- `content/`를 직접 수정하면 다음 생성 때 덮어써진다.
- 유지보수 시 어떤 파일이 원본인지 헷갈리지 않게 해야 한다.

따라서 실무적으로는 다음 규칙을 지키는 것이 좋다.

- 노트 내용 수정: `obsidian/`에서 한다.
- 사이트 구조/설정 수정: `site.config.ts`, `quartz.*`, `scripts/`에서 한다.
- `content/`는 생성 결과로 취급한다.

## 4. 노트 변환 시 적용되는 규칙

### 4-1. frontmatter 추가

원본 노트에 frontmatter가 없더라도, 생성된 파일에는 사이트용 frontmatter를 붙인다.

예를 들어 이런 정보가 들어간다.

- `title`
- `description`
- `draft: false`
- `date`
- `tags`
- `category`

이 정보는 Quartz가 목록, 미리보기, 메타데이터, 카테고리 분류를 처리하는 데 필요하다.

### 4-2. 위키링크 변환

Obsidian 노트에는 `[[Q-Learning]]` 같은 위키링크가 있다.

Quartz는 Obsidian 호환 기능이 있지만, 이번 구현에서는 파생본 생성 단계에서 명시적인 링크로 바꿔서 더 예측 가능하게 만들었다.

예:

- 원본: `[[SARSA]]`
- 생성본: `[SARSA](./sarsa)`

이렇게 하면 링크 경로를 빌드 전에 눈으로 확인하기 쉽고, 변환 규칙도 통제할 수 있다.

### 4-3. 이미지 임베드 변환

Obsidian에서는 `![[Pasted image 20260327222814.png]]` 같은 방식으로 이미지를 삽입한다.

이 형식은 일반 Markdown 이미지 링크가 아니므로, 생성 스크립트가 아래 작업을 한다.

- 실제 이미지 파일을 `content/` 아래로 복사
- 노트 내부의 임베드 구문을 `![](...)` 형식으로 변환

예:

- 원본: `![[Pasted image 20260327222814.png]]`
- 생성본: `![](./figures/Pasted image 20260327222814.png)`

### 4-4. 본문은 가급적 유지

이번 프로젝트는 “원문 보존”이 중요하므로, 문장 자체를 적극적으로 고치지 않는다.

바꾸는 것은 아래 정도뿐이다.

- frontmatter 추가
- 링크 변환
- 이미지 경로 변환
- 설명 추출

즉, 내용 편집이 아니라 “사이트 호환 처리”에 가깝다.

## 5. 카테고리 구조

사이트의 주요 콘텐츠 루트는 아래와 같다.

- `content/datascience/rl`
- `content/datascience/rnn`
- `content/datascience/transformer`

이 구조를 쓴 이유는 다음과 같다.

- 원본 폴더 구조를 크게 바꾸지 않기 위해
- 카테고리 탐색이 쉬워지도록 하기 위해
- Quartz의 folder page 기능을 자연스럽게 쓰기 위해

또한 각 카테고리에는 `index.md`를 생성해서, 단순 목록이 아니라 “짧은 소개 + 노트 목록” 구조가 되게 했다.

하지만 이 문서 기준으로는 여기서 한 단계 더 확장해 이해해야 한다.

### 앞으로 고려해야 할 구조

현재:

- `obsidian/Datascience/RL/Q-Learning.md`

향후 가능한 구조:

- `obsidian/AI/LLM/Attention/KV Cache.md`
- `obsidian/Datascience/RL/Actor-Critic/A2C.md`
- `obsidian/Datascience/RL/Actor-Critic/PPO.md`

이런 구조가 들어오더라도 시스템은 아래 원칙으로 동작해야 한다.

- 최상위 폴더는 사이트의 큰 섹션이 된다.
- 그 아래 모든 하위 폴더는 깊이에 상관없이 유지된다.
- 각 폴더는 필요하면 `index.md`를 자동 생성해 설명과 하위 목록을 가진다.
- 개별 노트의 URL은 원본 상대경로를 반영하되 웹 친화적으로 slug화한다.

즉, 장기적으로는 “현재 카테고리 3개”가 아니라 “임의의 최상위 섹션 + 임의의 깊이를 가진 노트 트리”를 다룰 수 있어야 한다.

## 6. 노트 정렬이 왜 별도 관리되는가

파일명 순서가 항상 학습 순서를 잘 반영하지는 않는다.

예를 들어 RL 노트는 아래 순서가 더 자연스럽다.

1. Value Function
2. Bellman Equation of V-function
3. Bellman Equation of Q-function
4. Bellman Optimality Equation
5. Exploration
6. Temporal Difference
7. SARSA
8. Q-Learning

그래서 정렬 순서는 파일 시스템에 맡기지 않고 `site.config.ts`에서 명시적으로 관리한다.

이 값은 두 군데에서 사용된다.

- 사이드바 Explorer 정렬
- 카테고리 페이지 목록 정렬

확장 관점에서 보면 정렬 전략도 두 층으로 나누는 것이 좋다.

- 명시적 순서가 필요한 핵심 노트: 설정 파일에서 수동 정렬
- 새로 생긴 깊은 하위 폴더나 일반 노트: 기본 알파벳순 또는 규칙 기반 정렬

이렇게 하면 `Actor-Critic` 같은 새 하위 폴더가 추가되어도 기존 시스템이 깨지지 않는다.

## 7. 레이아웃 구조

레이아웃은 Quartz 기본 구조를 크게 깨지 않으면서 아래 방향으로 조정했다.

- 왼쪽: 사이트명, 검색, 다크모드, 노트 탐색기
- 중앙: 실제 페이지 내용
- 홈 중앙: 자기소개 + 외부 링크 + 카테고리 카드
- 오른쪽: 비움

그래프와 백링크를 숨긴 이유는, 이번 MVP의 우선순위가 “개인 소개 + 카테고리 탐색”이기 때문이다.

## 8. 이 구조의 장점

이 구조는 다음 장점이 있다.

- 원본 노트 보호
- 재생성 가능
- 설정과 콘텐츠 로직 분리
- 유지보수 시 변경 지점이 명확함
- 배포 자동화와 궁합이 좋음

즉, 작은 프로젝트처럼 보여도 실제로는 꽤 안정적인 구조다.

그리고 장기적으로는 다음 성질까지 만족하도록 발전시키는 것이 바람직하다.

- 단일 섹션에서 다중 섹션으로 확장 가능
- 2단계 폴더에서 N단계 폴더로 확장 가능
- 하위 구조가 깊어져도 링크 계산과 인덱스 생성이 유지됨
