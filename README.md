# 개인 소개 페이지 + 프론트엔드·백엔드 연동 (클라우드컴퓨팅실습 개인과제)

KAIST 디지털금융MBA 「클라우드컴퓨팅실습」 개인과제입니다.
HTML로 만든 **개인 소개 페이지**와, 2주차 워크북 방식의 **React(Vite) 프론트엔드**가 3주차에 만든 **FastAPI 가계부 API**를 호출하도록 배포하고 서로 연결했습니다.

## 배포 주소

| 구분 | 주소 |
|---|---|
| API 연동 실습 페이지 (Vercel, React) | https://individual-assignment-1-murex.vercel.app |
| 개인 소개 페이지 (Vercel, HTML) | https://individual-assignment-1-murex.vercel.app/intro/ |
| 백엔드 Swagger UI (Render) | https://individual-assignment-api.onrender.com/docs |

> Render 무료 플랜은 15분 동안 요청이 없으면 잠듭니다. 첫 접속에 30~60초 걸릴 수 있고, 데이터는 서버 메모리에 저장되므로 서버가 다시 시작되면 초기화됩니다(3주차 워크북 ⑥-④와 같은 동작).

## 프로젝트 소개

- **API 연동 실습 페이지 (React)**: 가계부 화면입니다. 거래를 등록·조회·삭제하면 브라우저가 `fetch`로 Render의 FastAPI 서버를 호출하고, 받은 JSON으로 목록과 수입·지출 합계를 그립니다.
  - 상단 **"이 페이지는 이렇게 동작합니다"** 카드에서 브라우저 → Vercel → Render → JSON 응답 흐름과, 각 버튼이 어떤 API를 호출하는지 단계별로 설명합니다.
  - 하단 **요청·응답 로그**에서 실제로 주고받은 요청과 응답(상태 코드 포함)을 확인할 수 있습니다.
- **개인 소개 페이지 (HTML)**: 소속(KAIST Professional MBA 13기)과 업무, 관심 분야(데이터 기반 의사결정·투자 전략·에너지 기술)를 소개합니다.
- 두 페이지는 상단 메뉴와 버튼 링크로 서로 오갈 수 있고, 다크모드 설정을 함께 씁니다.

## 주요 구성

```
.
├─ README.md
├─ frontend/                     # Vercel 배포 (Root Directory = frontend, Preset = Vite)
│  ├─ index.html                 # React 앱 진입점
│  ├─ src/
│  │  ├─ main.jsx
│  │  ├─ App.jsx                 # 가계부 화면: useState·useEffect·fetch로 API 호출
│  │  └─ App.css
│  ├─ public/                    # 빌드 없이 그대로 배포되는 정적 파일
│  │  ├─ intro/index.html        # 개인 소개 페이지 (HTML)
│  │  ├─ style.css               # 두 페이지 공통 스타일
│  │  └─ theme.js                # 소개 페이지 다크모드
│  ├─ .env.example               # VITE_API_URL 예시 (.env 는 GitHub에 올리지 않음)
│  └─ package.json · vite.config.js
└─ backend/                      # Render 배포 (Root Directory = backend)
   ├─ app/
   │  ├─ main.py                 # 앱 생성, CORS 설정(ALLOWED_ORIGINS), 라우터 등록
   │  ├─ models.py               # Pydantic 요청·응답 모델
   │  └─ routers/transactions.py # 거래 CRUD 엔드포인트
   └─ requirements.txt
```

### 동작 흐름

```
브라우저 ──> React 프론트엔드(Vercel) ──fetch──> FastAPI 백엔드(Render) ──JSON──> 화면 갱신
              VITE_API_URL 로 주소 지정         ALLOWED_ORIGINS 로 CORS 허용
```

### 백엔드 API (FastAPI)

| 메서드 | 경로 | 설명 | 성공 코드 |
|---|---|---|---|
| GET | `/` | 환영 메시지 | 200 |
| GET | `/health` | 서버 상태 확인 | 200 |
| GET | `/transactions?skip=0&limit=10` | 거래 목록 | 200 |
| POST | `/transactions` | 거래 등록 (Pydantic 검증, 실패 시 422) | 201 |
| GET | `/transactions/{id}` | 거래 한 건 조회 (없으면 404) | 200 |
| DELETE | `/transactions/{id}` | 거래 삭제 (없으면 404) | 204 |

### 사용 기술

- 프론트엔드: React(Vite), JavaScript(`fetch`, `async/await`), HTML·CSS
- 백엔드: Python, FastAPI, Pydantic, Uvicorn
- 배포: Vercel(프론트엔드), Render(백엔드), GitHub(소스 관리)

## 실습워크북과의 대응

| 구성 | 따른 워크북 절차 |
|---|---|
| 백엔드 코드 (CRUD·검증·오류 처리·`app/` 구조) | 3주차 단계 1~5 |
| 백엔드 배포 (`requirements.txt`, Start Command `app.main:app`) | 3주차 단계 6 |
| CORS 허용 주소를 환경변수 `ALLOWED_ORIGINS` 로 관리 | 2주차 ⑤-② |
| React(Vite) 프론트, `fetch` 로 API 호출 | 2주차 ①, ③-④ |
| API 주소를 환경변수 `VITE_API_URL` 로 관리, `.env` 는 `.gitignore` | 2주차 ①-③, ⑤-⑥ |
| push 한 번으로 Vercel·Render 자동 배포 (CI/CD) | 2주차 ②-③ |

**워크북과 다른 점과 이유**
- **저장소 1개에 frontend/와 backend/를 함께 둠** → 과제 제출 항목이 GitHub 저장소 주소 1개이므로 한 저장소로 모았습니다. 그래서 Vercel·Render 에서 각각 **Root Directory**(`frontend`, `backend`)를 지정했습니다.
- **소개 페이지는 React가 아닌 HTML** → 과제 안내에 따라 HTML로 작성하고, Vite의 `public/` 폴더에 두어 빌드 없이 그대로 배포되게 했습니다.

## 배포 설정

**Render (백엔드)**

| 항목 | 값 |
|---|---|
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| 환경변수 | `ALLOWED_ORIGINS` = `https://individual-assignment-1-murex.vercel.app` (끝에 `/` 없이) |

**Vercel (프론트엔드)**

| 항목 | 값 |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Vite (Build `npm run build`, Output `dist`) |
| 환경변수 | `VITE_API_URL` = `https://individual-assignment-api.onrender.com` (끝에 `/` 없이) |

## 로컬에서 실행하기

```bash
# 1) 백엔드 (터미널 1)
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
fastapi dev app/main.py          # http://127.0.0.1:8000/docs

# 2) 프론트엔드 (터미널 2)
cd frontend
cp .env.example .env             # VITE_API_URL=http://localhost:8000
npm install
npm run dev                      # http://localhost:5173 (소개 페이지: /intro/)
```

## 문제 해결 기록

| 증상 | 원인 | 해결 |
|---|---|---|
| Render 저장소 목록에 새 저장소가 보이지 않음 | GitHub의 Render 앱 접근 권한이 "선택한 저장소만"으로 되어 있었음 | GitHub 앱 설정에서 저장소 접근을 추가 |
| 배포된 화면에서 백엔드 연결 실패 (CORS) | `ALLOWED_ORIGINS` 를 처음에 Vercel 에 입력함. CORS 허용은 **요청을 받는 백엔드**가 선언하는 것 | Render 환경변수로 옮기고 재배포 → 연결 성공 |
| 재배포 후 등록한 거래가 사라짐 | 데이터가 서버 메모리(`fake_db`)에만 있어 재시작 시 초기화 | 워크북상 정상 동작. 영구 저장은 4주차 데이터베이스(Supabase)에서 다룸 |

## 배운 점

- 브라우저는 다른 출처의 응답을 기본적으로 막고(CORS), 백엔드가 허용할 출처를 선언해야 연동됩니다.
- "바뀌는 값은 코드가 아니라 환경변수로": 프론트는 `VITE_API_URL`, 백엔드는 `ALLOWED_ORIGINS` 로 관리했습니다. `VITE_` 환경변수는 빌드할 때 코드에 새겨지므로 값을 바꾸면 재배포해야 합니다.
- Pydantic 모델 덕분에 잘못된 입력(음수 금액, 빈 카테고리 등)은 함수 실행 전에 422로 걸러집니다.
- GitHub에 push하면 Vercel과 Render가 자동으로 다시 배포됩니다(CI/CD).
