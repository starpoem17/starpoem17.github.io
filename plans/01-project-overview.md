# Reference 기반 Quartz 재설계 개요

## 1. 이 문서의 목적

이 프로젝트는 `obsidian/` 안의 Markdown 노트를 `Quartz`로 공개 사이트로 만드는 작업이다.
이번 단계의 기준점은 아래 두 곳이다.

- `https://hchautran.github.io/`
- `https://github.com/hchautran/quartz`

즉, 현재 사이트를 조금 손보는 것이 아니라, reference를 기준으로 홈과 왼쪽 탐색 구조를 다시 정리하는 작업으로 이해해야 한다.

## 2. 이번 재설계의 핵심 목표

최종 사이트는 아래 구조를 가져야 한다.

- 왼쪽: `Notes` 중심의 다층 노트 트리
- 중앙: reference와 유사한 `About Me` 중심 소개
- 우측: 보조 패널 없음

현재 제거 또는 수정이 필요한 구체 항목은 다음과 같다.

- 홈 상단의 `About`, `Notes` 버튼 제거
- 카드형 프로필 박스 제거
- `Notes {#notes}`가 그대로 보이는 문제 제거
- 왼쪽 `Notes` 토글을 눌러도 반응이 없는 문제 해결

## 3. 화면 기준

### 중앙 홈

홈은 문서형 소개 페이지처럼 보여야 한다.

- `About Me` 제목
- 프로필 사진
- 이름
- 한 줄 역할 설명
- 짧은 소개 문단
- `Email`, `LinkedIn`, `GitHub` 버튼 3개
- 그 아래 `Notes` 단락

중요한 점은, 이 구성이 박스 카드 안에 들어간 랜딩 카드처럼 보이면 안 된다는 것이다.
reference처럼 본문 흐름 속 소개 섹션에 가깝게 보여야 한다.

### 왼쪽 탐색기

왼쪽은 `Notes` 하나를 헤더로 가지는 트리 탐색기여야 한다.

- `Notes` 헤더
- 여러 최상위 섹션
- 중간 폴더
- 더 깊은 하위 폴더
- 개별 노트

즉, 현재 존재하는 `Datascience`뿐 아니라 이후 들어올 수 있는 `CUDA`, `AI` 같은 다른 최상위 폴더도 고려해야 한다.

## 4. 현재 제외 대상

현재 단계에서는 아래 기능을 넣지 않는다.

- News
- Publications
- Service
- 우측 Graph
- Table of Contents
- Related Notes

다만 `News`, `Publications`, `Service`는 이후 확장 가능성을 `plans/` 문서 안에 남겨둔다.

## 5. 최상위 기준 문서

이 프로젝트의 의사결정 우선순위는 아래와 같다.

1. `personal/RULE.md`
2. `personal/reference.md`
3. `plans/*.md`
4. 실제 코드

특히 `personal/*.md`는 사용자가 직접 작성한 문서이므로 수정하지 않는다.
