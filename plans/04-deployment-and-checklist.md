# 배포 및 검증 체크리스트

## 1. 배포 전 확인

배포 전에는 아래 세 가지를 먼저 확인한다.

- `personal/reference.md`와 `plans/` 문서가 같은 방향을 가리키는가
- 홈 구조가 reference 기준과 충돌하지 않는가
- Explorer 토글이 실제로 반응하는가

## 2. 로컬 확인 명령

### 콘텐츠 재생성

```bash
npm run generate:content
```

### 프로덕션 빌드

```bash
npm run build
```

### 타입/포맷 검사

```bash
npm run check
```

## 3. UI 체크리스트

- 홈 상단에 `About`, `Notes` 버튼이 남아 있지 않은가
- `About Me`가 카드형 박스가 아니라 본문형 섹션인가
- 프로필 사진, 이름, 역할, 3개 링크 버튼이 자연스럽게 배치되는가
- `Notes {#notes}`가 그대로 보이지 않고 `Notes`만 보이는가
- 왼쪽 헤더가 `Notes`로 보이는가
- 왼쪽 `Notes`를 눌렀을 때 접힘/펼침이 눈에 보이게 동작하는가

## 4. 탐색 체크리스트

- `Datascience` 진입이 404 없이 동작하는가
- 섹션, 폴더, 노트가 다층 구조로 표시되는가
- 더 깊은 하위 폴더가 생겨도 Explorer 구조가 유지될 수 있는가
- 홈과 Explorer의 링크 기준이 같은 슬러그 규칙을 따르는가

## 5. GitHub Pages 반영 절차

```bash
git add .
git commit -m "Align homepage and explorer with reference"
git push origin main
```

푸시 후에는 GitHub에서 아래를 확인한다.

- `Actions`의 Pages workflow 성공
- `Settings > Pages`에서 최신 배포 확인
- `https://starpoem17.github.io/`에서 실제 변경 반영 확인

## 6. 이후 확장 시 주의점

향후 `News`, `Publications`, `Service`를 넣을 수는 있다.
하지만 그 작업은 이번 홈 재설계와 분리해서 다뤄야 한다.

그 시점에 다시 검토할 항목은 다음과 같다.

- 홈 정보 구조 확장 방식
- `Table of Contents` 재도입 여부
- 상단 내비게이션 필요성
