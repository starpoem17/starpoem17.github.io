# 배포 방법과 운영 체크리스트

## 1. 이 문서의 목적

이 문서는 reference 방향을 반영한 사이트를 실제로 게시하고 유지하기 위한 운영 기준을 정리한다.

즉, 아래 두 상황에서 참고하는 문서다.

- 처음 GitHub Pages에 공개할 때
- 노트, 소개, 탐색 구조를 수정한 뒤 다시 반영할 때

## 2. 배포 전 기본 확인

배포 전에 가장 먼저 확인할 것은 아래 세 가지다.

### 1. 기준 문서와 계획 문서가 일치하는가

- `personal/reference.md`
- `plans/*.md`

### 2. 실제 사이트 구조가 계획과 일치하는가

- 왼쪽 다층 노트 트리
- 중앙 About me
- 프로필 사진
- Email / LinkedIn / GitHub 버튼
- Notes 단락

### 3. 현재 제외 대상이 실제로 빠져 있는가

- Graph
- Table of Contents
- Related Notes
- News
- Publications
- Service

## 3. 로컬에서 확인하는 방법

### 개발 서버

```bash
npm run dev
```

이 명령은 콘텐츠를 다시 생성하고 Quartz 개발 서버를 띄운다.

### 프로덕션 빌드

```bash
npm run build
```

이 명령은 실제 배포와 가까운 상태의 정적 산출물을 만든다.

### 코드/설정 검사

```bash
npm run check
```

이 명령은 타입과 포맷 검사를 통해 설정/스크립트 변경이 깨지지 않았는지 확인한다.

## 4. GitHub Pages 배포 절차

### 1단계. 로컬 변경 정리

```bash
git add .
git commit -m "Update Quartz site"
```

### 2단계. GitHub에 푸시

```bash
git push origin main
```

### 3단계. GitHub Actions 확인

GitHub 저장소에서 다음을 확인한다.

1. `Actions`
2. `Deploy Quartz site to GitHub Pages`
3. build와 deploy가 모두 성공했는지 확인

### 4단계. Pages 설정 확인

GitHub 저장소에서 다음을 확인한다.

1. `Settings`
2. `Pages`
3. `Source`가 `GitHub Actions`인지 확인

## 5. 운영 중 수정 위치 안내

### 소개/링크/사진을 바꾸고 싶을 때

확인 파일:

- `site.config.ts`
- 프로필 자산 경로

점검 항목:

- 이름
- 소개 문구
- 이메일
- GitHub
- LinkedIn
- 프로필 이미지 경로

### 왼쪽 노트 트리를 바꾸고 싶을 때

확인 파일:

- `site.config.ts`
- `quartz.custom.ts`
- `quartz.layout.ts`
- `scripts/generate-content.ts`

점검 항목:

- 최상위 섹션 정의
- 하위 폴더 구조
- 정렬 규칙
- 탐색기 렌더링

### 새 최상위 섹션을 추가할 때

예:

- `obsidian/CUDA`
- `obsidian/AI`

확인 파일:

- `site.config.ts`
- `scripts/generate-content.ts`
- 필요 시 `quartz.custom.ts`

점검 항목:

- 섹션 정의 추가
- 섹션 인덱스 생성
- 홈과 탐색기 반영
- 정렬 규칙 반영

### 더 깊은 하위 폴더를 추가할 때

예:

- `obsidian/Datascience/RL/Actor-Critic/A2C.md`

확인 파일:

- `scripts/generate-content.ts`
- `site.config.ts`
- `quartz.custom.ts`

점검 항목:

- 재귀 경로 처리
- 링크 경로 계산
- 중간 폴더 인덱스
- 탐색기 표시 순서

## 6. 배포 전 체크리스트

### 콘텐츠 체크리스트

- 원본 노트는 `obsidian/`에서만 수정했는가
- `personal/*.md`는 수정하지 않았는가
- 새 섹션/새 폴더가 생겼다면 계획 문서에도 반영했는가
- 프로필 사진이 최종 사이트 자산 경로 기준으로 준비되었는가
- 이미지 파일명이 충돌하지 않는가
- 내부 링크 대상이 실제 존재하는가

### UI 체크리스트

- 왼쪽에 다층 노트 트리가 보이는가
- About me에 사진, 이름, 3개 버튼이 보이는가
- Notes 단락이 중앙 구조 안에 자연스럽게 배치되는가
- Graph가 제거되었는가
- Table of Contents가 제거되었는가
- Related Notes가 제거되었는가
- News, Publications, Service가 현재는 노출되지 않는가

### 구조 체크리스트

- 최상위 섹션이 여러 개여도 탐색이 자연스러운가
- 깊은 하위 폴더에서도 링크와 탐색이 정상 동작하는가
- 중간 폴더 인덱스가 필요하면 생성될 수 있는 구조인가

### 정리 체크리스트

- `public/` 같은 빌드 산출물이 저장소에 불필요하게 남아 있지 않은가
- `tsconfig.tsbuildinfo`가 정리 대상에 포함되어 있는가
- `docs/`가 계속 필요한지 검토했는가
- `.github` 기본 메타 파일 중 불필요한 것이 남아 있지 않은가

## 7. 현재 구현에서 알아둘 점

### 1. `content/`는 생성 결과다

직접 수정해도 다시 생성하면 덮어써질 수 있다.
따라서 원칙은 아래와 같다.

- 원문 수정: `obsidian/`
- 기준 수정: `personal/`
- 계획 수정: `plans/`
- 생성/렌더링 수정: `site.config.ts`, `scripts/`, `quartz.*`

### 2. 프로필 사진은 현재 루트에 있지만 영구 위치가 아니다

`profile.jpg`는 현재 존재하지만, 계획상 최종 자산 경로로 정리하는 것이 맞다.
따라서 운영 시에는 “사이트가 어떤 경로를 참조하는지”를 먼저 기준으로 봐야 한다.

### 3. 확장 기능은 지금 넣지 않는다

아래는 현재는 넣지 않는다.

- News
- Publications
- Service

이 항목들은 구현 중간에 섞어 넣지 말고, 별도 확장 작업으로 다루는 것이 맞다.

## 8. 추천 운영 습관

- `personal/reference.md`를 먼저 보고 화면 방향을 확인한다.
- 새 노트나 새 폴더를 넣을 때 `plans/`도 같이 업데이트한다.
- 큰 변경 후에는 `npm run build`와 `npm run check`를 함께 돌린다.
- 탐색 구조를 바꿀 때는 얕은 폴더와 깊은 폴더 둘 다 테스트한다.
- 정리 작업은 기능 수정과 같이 묶지 말고, 계획에 따라 의도적으로 수행한다.
