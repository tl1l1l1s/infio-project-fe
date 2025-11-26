# Community (Frontend)

- 커뮤니티 웹 애플리케이션 서비스의 정적 HTML/CSS와 바닐라 ES 모듈 기반 UI

## 기술 스택

- HTML, CSS, JavaScript (ES Modules)
- 브라우저 `fetch`로 Spring Boot 백엔드(`http://localhost:8080`) 호출
- 쿠키 기반 인증

## 주요 기능 / 특징

- 회원가입/로그인/로그아웃 및 프로필/비밀번호 변경 플로우
- 게시글 목록/상세 조회, 작성/수정/삭제, 페이지네이션
- 댓글 작성/수정/삭제 및 좋아요 토글, 게시글별 카운트 반영
- 비로그인 접근 시 로그인 페이지로 리다이렉트

## 시연 영상

- 추가 예정

## 프로젝트 구조

```
ktb3-theta-full-community-fe/
 ㄴ index.html, login.html, join.html, my.html
 ㄴ articles/
    ㄴ detail.html, edit.html, write.html ...
 ㄴ scripts/
    ㄴ pages/         # 페이지별 스크립트(로그인/회원가입/마이/게시글 CRUD 등)
    ㄴ components/    # 공용 UI 조각(헤더, 모달, 토스트)
    ㄴ utils/         # API 래퍼, auth 가드, DOM/포맷/이미지 유틸
 ㄴ styles/           # 전역/페이지별 CSS
 ㄴ assets/           # 이미지, 아이콘 등 정적 리소스
```

## 학습한 내용

- 추가 예정

## 설치 및 실행 방법

1. 저장소 클론: `git clone <repo-url>`
2. 프론트엔드 디렉터리 이동: `cd ktb3-theta-full-community-fe`
3. 정적 서버 준비: `npm install -g http-server` (또는 임의의 정적 서버)
4. 로컬 실행: `http-server . -p 5500`
5. 백엔드가 `http://localhost:8080`에서 동작 중인지 확인 후 브라우저에서 접속
