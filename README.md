# INFIO Community (Frontend)

<table>
  <tr>
    <td valign="top" width="200">
      <img src="https://github.com/user-attachments/assets/0571a8fb-27bd-4b3a-8b5b-6df4a7542bc8" alt="Infio Logo" width="100%" />
    </td>
    <td valign="middle">
      미니멀리즘적인 UI/UX를 통해 빠르고 정확하게 <b>정보를 공유하는 웹 커뮤니티 서비스</b>입니다. <br/> 
      불필요한 복잡함은 전부 덜어내고 정보(Information)와 관심사에만 집중할 수 있어요.
    </td>
  </tr>
</table>

## 개요
Vite 기반 React <br>
정적 HTML/CSS + 바닐라 ES 모듈 버전은 `legacy/` 내에 존재

- 개발 기간 : 2025.10. - 2025. 12. (2개월)
- 개발 인원 및 담당 역할 : 1인 (기획, 디자인, 개발)

### 프로젝트 구조
```
ktb3-theta-full-community-fe/
  ├── src/
  │   ├── api/                           # Axios 인스턴스, React Query 클라이언트, 도메인별 API 모듈
  │   ├── components/
  │   │   ├── layout/                    # 공용 레이아웃(헤더/푸터 등)
  │   │   └── common/                    # 버튼, 토스트 등 공용 UI
  │   ├── contexts/                      # 전역 컨텍스트(예: 사용자 상태)
  │   ├── features/                      # 도메인별 훅/컴포넌트 articles/auth/comments/likes/users (+comments/
  articles 전용 components)
  │   ├── hooks/                         # 재사용 훅
  │   ├── lib/                           # 라우터/쿼리 설정 등 공용 라이브러리
  │   ├── utils/                         # 유틸 함수
  │   └── pages/                         # 라우팅 페이지(Home/Login/Join/My/게시글 CRUD)
  │   ├── App.jsx, main.jsx, App.css, global.css
  ├── public/
  │   └── assets/images/                 # 정적 이미지
  ├── legacy/                            # 바닐라 ES 모듈 기반 정적 버전
  │   ├── assets/images/
  │   ├── articles/                      # 정적 HTML 페이지
  │   ├── scripts/                       # components/pages/utils 스크립트
  │   └── styles/                        # 공용/컴포넌트/게시글 스타일
  ├── index.html
  ├── package.json, package-lock.json
  ├── vite.config.js, eslint.config.js
  └── README.md
```

## 기술 스택

<img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"> <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"> <img src="https://img.shields.io/badge/React_Router_DOM_7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white"> <img src="https://img.shields.io/badge/TanStack_Query_5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white"> <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white"> <img src="https://img.shields.io/badge/CSS_Modules-000000?style=for-the-badge&logo=css3&logoColor=white"> 

### 🗂️ /legacy
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

## 주요 기능

### 게시글
- Home
  - Infinite Scroll(7개 단위 페이지네이션) 목록 조회
  - 게시글 작성 버튼
- 작성/수정
  - 필수값 검증: 주제 / 제목 / 본문
  - 이미지 업로드 및 미리보기 지원
- 상세
  - 작성자 전용 수정 / 삭제 기능

### 댓글
- 상세 화면에서 인라인 처리
  - Infinite Scroll 목록 조회
  - 작성 / 수정 / 삭제 시 Optimistic Update, 댓글 카운트 증감 반영

### 좋아요
- 상세 페이지 좋아요 토글
  - Optimistic Update로 즉시 반영

### 인증
- 로그인
  - 이메일 / 비밀번호 형식 검증
- 회원가입
  - 이메일 / 닉네임 중복 검사, 비밀번호 규칙 검증
- Axios 인증 처리 : `401 token_expired` 시 자동 리프레시 시도

### 마이페이지 / 프로필
- 내 정보 표시
- 프로필 수정
  - 닉네임 변경, 프로필 이미지 업로드 / 미리보기 / 삭제, 비밀번호 변경

### UI / UX 공통
- 전체 레이아웃 : 헤더 / 푸터 / Toast container
- 공통 컴포넌트 : Button / Modal / Action Menu / Input

## 상세 화면
_클릭 시 유튜브로 이동합니다._ <br />
[![Video Label](https://img.youtube.com/vi/sKGC0xNvk4k/0.jpg)](https://youtu.be/sKGC0xNvk4k)

### 홈 화면
<img width="1512" height="824" alt="Screenshot 2025-12-07 at 23 16 01" src="https://github.com/user-attachments/assets/c8bd55da-adba-4953-ac36-90e535bb89ea" />
<img width="1512" height="822" alt="Screenshot 2025-12-07 at 23 14 38" src="https://github.com/user-attachments/assets/a8eec40d-d7bd-43b4-8f57-9f4848d7e010" />

### 회원가입
<img width="1512" height="822" alt="Screenshot 2025-12-07 at 23 18 51" src="https://github.com/user-attachments/assets/4193cd5e-ac33-4156-97d3-70cd0629edab" />

### 로그인
<img width="1512" height="822" alt="Screenshot 2025-12-07 at 23 15 01" src="https://github.com/user-attachments/assets/89e73048-1b53-47b9-bb7a-b117b704bef7" />

### 게시글
<img width="1512" height="815" alt="Screenshot 2025-12-07 at 23 14 55" src="https://github.com/user-attachments/assets/03049399-f4a4-4b7f-87d3-3d138c7eab76" />

### 마이페이지
<img width="1512" height="823" alt="Screenshot 2025-12-07 at 23 16 07" src="https://github.com/user-attachments/assets/ee285143-970c-4e5b-81d3-a5facc2b54cf" />

### 회원정보 수정
<img width="1512" height="824" alt="Screenshot 2025-12-07 at 23 16 13" src="https://github.com/user-attachments/assets/866b9d1d-4b46-48e8-af1d-5586c22d98ba" />
<img width="1512" height="823" alt="Screenshot 2025-12-07 at 23 16 20" src="https://github.com/user-attachments/assets/9c4b1fe7-7af1-4540-8dca-3e698b095d21" />

## 설치 및 실행 방법

0. 백엔드 `http://localhost:8080` 실행 필요
1. 저장소 클론: `git clone <repo-url>`
2. 디렉터리 이동: `cd ktb3-theta-full-community-fe`
3. 패키지 설치: `npm install`
4. 로컬 개발 서버: `npm run dev` 후 Vite가 안내한 주소로 접속

## Backend Repository...
[👉 Infio-BE-Repository](https://github.com/tl1l1l1s/infio-project-be)
