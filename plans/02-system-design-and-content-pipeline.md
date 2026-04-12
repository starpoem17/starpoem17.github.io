# 시스템 구조와 콘텐츠 생성 흐름

## 1. 전체 구조

이 프로젝트는 크게 6개 영역으로 이해하면 된다.

### 1. 원본 노트 영역

- 위치: `obsidian/`
- 역할: 사용자가 직접 작성한 원본 노트 보관

현재 실제 콘텐츠는 `obsidian/Datascience` 아래에 있지만, 시스템 설명은 항상 `obsidian/` 전체를 기준으로 해야 한다.
왜냐하면 앞으로 `Datascience` 외의 최상위 폴더가 추가될 수 있기 때문이다.

### 2. 개인 기준 문서 영역

- 위치: `personal/`
- 역할: 계획과 구현의 상위 기준 제공

여기 있는 문서는 직접 수정하지 않는다.
대신 `plans/`와 실제 코드의 방향을 결정하는 기준으로 삼는다.

### 3. 계획 문서 영역

- 위치: `plans/`
- 역할: 구현 방향, 구조, 운영 원칙 기록

이 문서들은 단순 메모가 아니라, 이후 구현자가 의사결정 없이 따라갈 수 있는 기준 문서다.

### 4. 사이트 설정 영역

- 위치: `site.config.ts`
- 역할: 변경 가능 값 관리

이 파일에는 최소한 아래 정보가 들어가야 한다.

- 이름
- 링크
- 이메일
- 소개 문구
- 프로필 이미지 경로
- 섹션 정의
- 노트 정렬 규칙

장기적으로는 여기서 `Datascience`, `CUDA`, `AI` 같은 최상위 섹션과, 중간 폴더 설명/정렬 규칙까지 관리할 수 있어야 한다.

### 5. 콘텐츠 생성 영역

- 위치: `scripts/generate-content.ts`
- 역할: 원본 노트를 Quartz용 콘텐츠로 변환

이 스크립트는 단순 복사기가 아니다.
아래 기능을 수행하는 파이프라인이다.

- `obsidian/` 전체 스캔
- Markdown 파일 탐색
- 이미지 자산 탐색
- 다층 폴더 구조 보존
- 홈/섹션/중간 폴더 인덱스 생성
- frontmatter 추가
- 링크 변환
- 이미지 경로 변환
- 최종 `content/` 생성

### 6. Quartz 렌더링/배포 영역

- `quartz.config.ts`
- `quartz.layout.ts`
- `quartz.custom.ts`
- `quartz/styles/custom.scss`
- `.github/workflows/deploy.yml`

이 영역이 생성된 콘텐츠를 실제 웹사이트로 렌더링하고 GitHub Pages에 게시한다.

## 2. 데이터 흐름

이 프로젝트의 데이터 흐름은 아래와 같다.

`personal 기준` + `obsidian 원본` -> `계획 문서` -> `변환 스크립트` -> `content 생성물` -> `Quartz 빌드` -> `public` -> `GitHub Pages`

실제 작업 흐름으로 풀어 쓰면 아래와 같다.

1. 사용자가 `obsidian/` 아래 원하는 위치에 노트를 작성한다.
2. 사용자는 `personal/` 문서로 사이트 방향을 정한다.
3. `plans/` 문서가 그 방향을 구현 가능한 계획으로 정리한다.
4. `generate-content` 스크립트가 원본을 Quartz용으로 변환한다.
5. Quartz가 생성된 `content/`를 읽어 정적 사이트를 만든다.
6. GitHub Actions가 결과물을 Pages에 배포한다.

## 3. 원본과 생성물의 분리

이 프로젝트에서 가장 중요한 구조는 원본과 생성물을 분리하는 것이다.

### 원본

- `obsidian/`
- `profile.jpg`

### 생성물

- `content/`
- `public/`

즉, 사람이 직접 관리하는 것은 원본이고, 사이트가 필요로 하는 것은 생성물이다.

이 구조를 지키면 다음 장점이 있다.

- 원본 안전성 확보
- 재생성 가능
- 디자인 변경 시 원문 유지
- 배포용 데이터와 작성용 데이터 분리

## 4. 왼쪽 노트 트리의 구조 원칙

reference 기준으로 가장 중요한 UI는 왼쪽 노트 트리다.

이 트리는 아래 구조를 전제로 설명해야 한다.

```text
obsidian
  Datascience
    RL
      Value Function.md
    RNN
      Mamba.md
  CUDA
    FlashAttention.md
```

또는

```text
obsidian
  Datascience
    RL
      Actor-Critic
        A2C.md
```

즉, 왼쪽 탐색기는 아래를 지원해야 한다.

- 여러 최상위 섹션
- 여러 단계의 중간 폴더
- 노트와 폴더의 혼합 구조
- 깊은 구조에서도 자연스러운 확장/접힘

따라서 데이터 파이프라인도 폴더 깊이를 고정 가정하면 안 된다.

## 5. 인덱스 페이지 생성 원칙

현재 계획 기준으로는 단순히 개별 노트만 생성하면 충분하지 않다.
다음 종류의 페이지를 만들 수 있어야 한다.

### 홈 페이지

- About me
- 프로필 사진
- Email / LinkedIn / GitHub 버튼
- Notes 단락

### 최상위 섹션 페이지

예:

- `Datascience`
- `CUDA`

이 페이지는 섹션 소개와 하위 폴더/노트 목록을 보여준다.

### 중간 폴더 페이지

예:

- `Datascience/RL`
- `Datascience/RL/Actor-Critic`

이 페이지는 해당 폴더의 설명과 하위 콘텐츠 목록을 보여줄 수 있어야 한다.

### 개별 노트 페이지

실제 Markdown 본문이 렌더링되는 페이지다.

## 6. 자산 파이프라인 원칙

이 프로젝트는 노트 본문 이미지뿐 아니라 프로필 사진도 관리해야 한다.

현재 프로필 사진은 저장소 루트의 `profile.jpg`로 존재한다.
하지만 계획 기준으로는 최종적으로 아래처럼 다루는 것이 맞다.

- 원본 자산으로서 `profile.jpg`를 보유
- 생성 또는 정리 과정에서 사이트 자산 폴더로 이동 또는 복사
- 홈의 About me 영역에서 해당 최종 자산 경로를 참조

즉, 프로필 사진도 노트 이미지와 마찬가지로 “사이트가 참조하는 자산 경로”를 가져야 한다.

## 7. 현재 제외되는 UI와 후속 확장 슬롯

현재 MVP에서는 아래 기능을 제거한다.

- Graph
- Table of Contents
- Related Notes
- News
- Publications
- Service

하지만 계획 문서에는 아래 가능성을 남긴다.

- `News`, `Publications`, `Service`를 About me 아래 또는 별도 섹션으로 추가
- 그 시점에 `Table of Contents`를 다시 도입할지 재검토

즉, “지금은 안 쓰지만 영구 삭제는 아님”이라는 상태를 계획상 분명히 해 둔다.

## 8. 불필요 파일 정리 원칙

reference 적용 과정에서 다음 파일들은 정리 후보가 된다.

### 산출물

- `public/`
- `tsconfig.tsbuildinfo`

### 기본 Quartz 메타/문서

- `docs/`
- `.github/FUNDING.yml`
- `.github/dependabot.yml`
- `.github/pull_request_template.md`

### 프로젝트 목적과 무관한 기본 안내 파일

- 필요 없어진 기본 README/보조 문서

정리 원칙은 간단하다.

- 사이트 운영과 배포에 직접 필요하면 유지
- 업스트림 흔적이지만 현재 프로젝트에 의미가 없으면 정리

## 9. 이 구조의 장점

이 구조는 다음 장점을 가진다.

- 개인 기준 문서와 실제 구현이 연결된다.
- 왼쪽 다층 노트 탐색 UI를 안정적으로 지원할 수 있다.
- 현재 `Datascience`만 있어도, 나중에 다른 섹션을 추가하기 쉽다.
- 지금 필요 없는 기능을 제거하고도 확장 여지는 보존할 수 있다.
- 불필요한 업스트림 파일을 정리해 프로젝트 목적을 더 선명하게 만들 수 있다.
