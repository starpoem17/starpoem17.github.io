# 배포 방법과 운영 체크리스트

## 1. 이 문서의 목적

이 문서는 구현된 사이트를 실제로 운영하기 위한 절차를 정리한다.

즉, 아래 두 상황에서 참고하는 문서다.

- 처음 GitHub Pages에 공개할 때
- 노트를 수정한 뒤 다시 반영할 때

## 2. 로컬에서 사이트를 확인하는 방법

### 개발 서버 실행

아래 명령을 실행한다.

```bash
npm run dev
```

이 명령은 다음 두 작업을 이어서 한다.

1. `generate:content`
2. Quartz 개발 서버 실행

즉, 원본 노트를 다시 생성한 후 바로 사이트 미리보기를 띄운다.

### 프로덕션 빌드 확인

아래 명령을 실행한다.

```bash
npm run build
```

이 명령은 다음을 한다.

1. `generate:content`
2. `npx quartz build`

결과적으로 `public/` 폴더에 실제 배포용 정적 파일이 생긴다.

## 3. GitHub Pages에 올리는 방법

### 1단계. GitHub 저장소 준비

이 프로젝트는 아래 저장소를 기준으로 설계되어 있다.

- `starpoem17/starpoem17.github.io`

현재 로컬 원격도 이 주소로 연결해 두었다.

### 2단계. 코드 푸시

아래 순서로 푸시한다.

```bash
git add .
git commit -m "Set up Quartz site from Obsidian notes"
git push -u origin main
```

### 3단계. GitHub Pages 설정

GitHub 저장소에서 아래를 설정한다.

1. `Settings`
2. `Pages`
3. `Source`를 `GitHub Actions`로 설정

그러면 이후부터는 `main` 브랜치에 푸시할 때마다 자동으로 배포된다.

## 4. 평소 운영 루틴

노트를 수정하고 사이트에 반영하는 가장 일반적인 루틴은 아래와 같다.

### 루틴

1. 현재는 `obsidian/Datascience`, 장기적으로는 `obsidian` 하위 해당 섹션에서 원본 노트 수정
2. `npm run build`
3. 결과 확인
4. `git add .`
5. `git commit -m "..."`
6. `git push`

GitHub Actions가 정상 동작하면 몇 분 뒤 Pages에 반영된다.

## 5. 변경 유형별 수정 위치

### 경우 1. 소개글을 바꾸고 싶다

수정 파일:

- `site.config.ts`

수정 대상:

- 이름
- 역할 문구
- 소개 문단
- 링크

### 경우 2. 노트 순서를 바꾸고 싶다

수정 파일:

- `site.config.ts`

수정 대상:

- `NOTES`
- 정렬 관련 상수

### 경우 2-1. 새 최상위 섹션을 추가하고 싶다

수정 파일:

- `site.config.ts`
- 필요 시 `scripts/generate-content.ts`

수정 대상:

- 섹션 정의
- 홈 화면 노출 방식
- 생성 규칙

### 경우 2-2. 더 깊은 하위 폴더를 추가하고 싶다

수정 파일:

- `site.config.ts`
- `scripts/generate-content.ts`
- 필요 시 `quartz.custom.ts`

수정 대상:

- 폴더 경로 정의
- 정렬 규칙
- 상대 링크 계산 규칙

### 경우 3. 위키링크 변환 규칙을 바꾸고 싶다

수정 파일:

- `scripts/generate-content.ts`

### 경우 4. 홈 화면 모양을 바꾸고 싶다

수정 파일:

- `quartz/styles/custom.scss`
- 필요 시 `content/index.md` 생성 로직

### 경우 5. 사이드바 동작을 바꾸고 싶다

수정 파일:

- `quartz.layout.ts`
- `quartz.custom.ts`

### 경우 6. 배포 방식을 바꾸고 싶다

수정 파일:

- `.github/workflows/deploy.yml`

## 6. 운영 중 확인해야 할 체크리스트

### 콘텐츠 체크리스트

- 새 원본 노트가 `site.config.ts`에 등록되어 있는가
- 새 최상위 폴더가 생겼다면 섹션 정의가 추가되어 있는가
- 새 하위 폴더가 생겼다면 경로 깊이와 정렬 규칙이 반영되어 있는가
- 이미지 파일명이 중복되지 않는가
- Obsidian 링크 대상이 실제 존재하는가
- 카테고리 설명이 최신 상태인가

### 빌드 체크리스트

- `npm run generate:content`가 성공하는가
- `npm run build`가 성공하는가
- `npm run check`가 성공하는가
- `public/`이 생성되는가

### 화면 체크리스트

- 홈 소개 영역이 정상 표시되는가
- GitHub / LinkedIn / Email 링크가 동작하는가
- 사이드바 섹션/카테고리/하위 폴더 정렬이 의도대로 보이는가
- 수식과 이미지가 깨지지 않는가

### 배포 체크리스트

- GitHub Actions가 성공했는가
- Pages URL이 열리는가
- 최근 커밋 내용이 사이트에 반영됐는가

## 7. 현재 구현에서 알아둘 점

### 1. Git 경고

로컬 빌드 시 `content` 쪽에 Git 히스토리가 없다는 경고가 나올 수 있다.

이 경고는 현재 구조에서 치명적이지 않다.
사이트 빌드 자체는 정상적으로 된다.

### 2. KaTeX 경고

일부 수식 안에는 한글이 들어 있다.
그래서 빌드 로그에 KaTeX 경고가 보일 수 있다.

중요한 점은 다음이다.

- 현재는 `warn` 수준이다.
- 빌드는 성공한다.
- 필요하면 나중에 수식 표기만 별도로 정리할 수 있다.

### 3. `content/`는 생성 결과다

직접 수정해도 다음 생성 시 바뀔 수 있다.

따라서 운영 원칙은 아래와 같다.

- 원문 수정: `obsidian/`
- 사이트 규칙 수정: `site.config.ts`, `scripts/`, `quartz.*`

### 4. 구조 확장 시 가장 먼저 볼 것

향후 `Datascience` 외 다른 폴더가 생기거나 `Actor-Critic` 같은 더 깊은 하위 폴더가 생기면, 제일 먼저 아래를 점검해야 한다.

- `site.config.ts`가 아직 단일 섹션 전제로 너무 고정되어 있지 않은가
- `scripts/generate-content.ts`가 경로 깊이를 일반화해서 다루는가
- `quartz.custom.ts`의 정렬 로직이 새 경로에도 적용되는가
- 홈 화면과 탐색기가 새 구조를 자연스럽게 드러내는가

## 8. 추천 운영 습관

이 프로젝트를 안정적으로 유지하려면 아래 습관이 좋다.

- 원본 노트를 먼저 수정하고 바로 빌드해 본다.
- 새 노트를 추가할 때 `site.config.ts` 등록을 같이 한다.
- 새 최상위 폴더나 깊은 하위 폴더를 추가할 때는 먼저 계획 문서와 설정 구조를 같이 업데이트한다.
- 큰 수정 전후로 `npm run check`를 돌린다.
- 홈 소개글과 링크는 `site.config.ts`만 수정한다.

이 네 가지만 지켜도 운영이 훨씬 수월해진다.
