# Quartz + Obsidian 프로젝트 개요

## 1. 이 프로젝트는 무엇인가

이 프로젝트는 `obsidian/` 안에 저장된 Markdown 노트들을 `Quartz`로 정적 웹사이트 형태로 공개하는 작업이다.

이 사이트는 단순한 블로그가 아니라 아래 두 목적을 동시에 가진다.

- 개인 소개 페이지
- Obsidian 노트 아카이브

즉, 방문자는 먼저 작성자가 누구인지 확인하고, 바로 왼쪽 노트 트리에서 문서를 탐색할 수 있어야 한다.

## 2. 이번 계획의 최우선 기준

이 프로젝트의 계획과 구현은 반드시 아래 문서들을 기준으로 따라야 한다.

- `personal/RULE.md`
- `personal/reference.md`

특히 중요한 규칙은 다음과 같다.

- `personal/*.md`는 사용자가 직접 작성한 문서이며 절대 수정하지 않는다.
- `plans/*.md`는 반드시 `personal/*.md`를 바탕으로 작성하고 수정한다.
- 실제 코드 변경도 `personal/*.md`와 `plans/*.md`를 근거로 한다.

## 3. 참고 사이트와 디자인 방향

이번 프로젝트는 아래 사이트를 참고 디자인으로 삼는다.

- `https://hchautran.github.io/`

다만 완전히 똑같이 복제하는 것이 목표는 아니다.
중요한 것은 아래 구조와 분위기를 따르는 것이다.

- 왼쪽 측면에 노트 트리 표시
- 중앙에 `About me`
- 중앙 소개 아래 `Notes` 단락
- 우측 보조 패널 없음

즉, 이번 사이트는 “소개가 있는 노트 탐색형 개인 사이트”로 이해하면 된다.

## 4. 최종 화면에서 보여야 하는 것

현재 MVP 기준으로 최종 화면은 아래 요소를 포함해야 한다.

### 중앙 영역

- 프로필 사진
- 이름
- Email 버튼
- LinkedIn 버튼
- GitHub 버튼
- 짧은 자기소개
- `Notes` 섹션

현재 프로필 사진 자산은 저장소 루트의 `profile.jpg`로 존재한다.
다만 이 파일은 임시 위치로 보고, 장기적으로는 사이트 자산 경로로 정리하는 것이 맞다.

### 왼쪽 영역

- `obsidian/` 안의 Markdown 구조를 반영한 다층 노트 트리
- 최상위 폴더
- 그 아래 중간 폴더
- 더 깊은 하위 폴더
- 개별 노트

즉, 왼쪽은 단순 카테고리 목록이 아니라 “실제 Obsidian 폴더 구조를 반영한 탐색기”여야 한다.

### 제외할 것

현재 MVP에서는 아래 요소를 제거 대상으로 본다.

- 우측 그래프
- Table of Contents
- Related Notes
- News
- Publications
- Service

단, `News`, `Publications`, `Service`는 추후 확장 가능성을 계획 문서에 남겨야 한다.
또한 `Table of Contents`도 나중에 이 섹션들이 추가될 경우 다시 검토할 수 있도록 여지를 남긴다.

## 5. 현재 구조와 앞으로의 확장

현재 실제 노트는 `obsidian/Datascience` 아래에 있다.
하지만 계획은 여기서 멈추면 안 된다.

향후 아래와 같은 구조가 들어올 수 있다.

```text
obsidian
    Datascience
        RL
            Value Function.md
        RNN
            Mamba
        Transformer
            Attention
            RoPE
    CUDA
        FlashAttention
```

또는 더 깊은 구조도 가능하다.

```text
obsidian
    Datascience
        RL
            Actor-Critic
                A2C.md
                PPO.md
```

따라서 이 프로젝트는 장기적으로 아래를 만족해야 한다.

- `Datascience` 외 여러 최상위 폴더 지원
- 2단계보다 깊은 하위 폴더 지원
- 깊은 경로를 반영한 왼쪽 트리 탐색 지원
- 중간 폴더에도 인덱스 페이지 또는 설명 페이지를 둘 수 있는 구조

## 6. 현재 구현의 핵심 원칙

### 원칙 1. 원본 노트는 수정하지 않는다

`obsidian/` 안의 원본 Markdown은 작성용 원본이며, 직접 수정 대상이 아니다.
사이트용 파일은 별도로 생성한다.

### 원칙 2. 변동 가능 값은 한 곳에 모은다

이름, 링크, 이메일, 소개 문구, 섹션 정의, 정렬 순서처럼 자주 바뀔 수 있는 값은 따로 모아 관리해야 한다.

### 원칙 3. 왼쪽 노트 트리는 다층 구조를 전제로 설계한다

현재 구조만 보고 고정 깊이로 설계하면 이후 `Actor-Critic` 같은 하위 폴더가 생겼을 때 바로 깨진다.
그래서 처음부터 다층 폴더 구조를 고려해야 한다.

### 원칙 4. 지금 불필요한 것은 정리 대상에 포함한다

reference를 따르는 과정에서 더 이상 필요 없는 기본 Quartz 파일이나 산출물은 계획에 정리 대상으로 포함한다.

대표적으로 아래가 후보가 된다.

- 기본 Quartz 문서 디렉터리
- GitHub 메타 파일 일부
- 이미 생성된 정적 산출물
- 타입 빌드 산출물

## 7. 이 문서 다음에 읽을 것

이 문서가 전체 방향을 설명한다면, 다음 문서는 더 구체적인 구조와 실행 방법을 설명한다.

- `02-system-design-and-content-pipeline.md`
- `03-implementation-guide.md`
- `04-deployment-and-checklist.md`
