# 개인 소개 페이지 + 프론트엔드·백엔드 연동 (클라우드컴퓨팅실습 개인과제)

KAIST 디지털금융MBA 클라우드컴퓨팅실습 개인과제입니다.
HTML로 만든 **개인 소개 페이지**와, 3주차에 만든 **FastAPI 가계부 API**를 호출하는 **프론트엔드 페이지**를 배포하고 서로 연결했습니다.

## 배포 주소

| 구분 | 주소 |
|---|---|
| 개인 소개 페이지 (Vercel) | https://YOUR-PROJECT.vercel.app/intro/ |
| API 연동 실습 페이지 (Vercel) | https://YOUR-PROJECT.vercel.app/expense/ |
| 백엔드 Swagger UI (Render) | https://individual-assignment-api.onrender.com/docs |

> Render 무료 플랜은 15분 동안 요청이 없으면 잠듭니다. 첫 접속에 30~60초 걸릴 수 있고, 데이터는 서버 메모리에 저장되므로 서버가 다시 시작되면 초기화됩니다.

## 프로젝트 소개

- **개인 소개 페이지**: 자기소개, 관심 분야, 수업에서 배우는 내용, 사이트 동작 구조를 담았습니다. 다크모드 전환 기능이 있습니다.
- **API 연동 실습 페이지**: 가계부 화면입니다. 거래를 등록·조회·삭제하면 브라우저가 `fetch`로 Render의 FastAPI 서버를 호출하고, 받은 JSON으로 목록과 수입·지출 합계를 그립니다. 화면 아래 **요청·응답 로그**에서 어떤 요청이 가고 어떤 응답(상태 코드 포함)이 왔는지 확인할 수 있습니다.
- 두 페이지는 상단 메뉴와 버튼 링크로 서로 오갈 수 있습니다.

## 주요 구성

```
.
├─ README.md
├─ frontend/                  # Vercel 배포 (Root Directory = frontend)
│  ├─ index.html              # 첫 화면 → /intro/ 로 이동
│  ├─ intro/index.html        # ① 개인 소개 페이지
│  ├─ expense/index.html      # ② API 연동 실습 페이지 (가계부)
│  ├─ style.css               # 공통 스타일
│  └─ theme.js                # 다크모드 전환
└─ backend/                   # Render 배포 (Root Directory = backend)
   ├─ app/
   │  ├─ main.py              # 앱 생성, CORS 설정, 라우터 등록
   │  ├─ models.py            # Pydantic 요청·응답 모델
   │  └─ routers/transactions.py  # 거래 CRUD 엔드포인트
   └─ requirements.txt
```

### 동작 흐름

```
브라우저 ──> 프론트엔드(Vercel) ──fetch──> FastAPI 백엔드(Render) ──JSON──> 화면 갱신
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

- 프론트엔드: HTML, CSS, JavaScript(`fetch`, `async/await`)
- 백엔드: Python, FastAPI, Pydantic, Uvicorn
- 배포: Vercel(프론트엔드), Render(백엔드), GitHub(소스 관리)

## 배포 설정

**Render (백엔드)**

| 항목 | 값 |
|---|---|
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| 환경변수 | `ALLOWED_ORIGINS` = Vercel 주소 (예: `https://YOUR-PROJECT.vercel.app`, 끝에 `/` 없이) |

**Vercel (프론트엔드)**

| 항목 | 값 |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Other (빌드 없음, 정적 파일) |

프론트엔드가 부를 백엔드 주소는 `frontend/expense/index.html`의 `RENDER_API_URL` 한 줄에 적습니다.

## 로컬에서 실행하기

```bash
# 1) 백엔드
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
fastapi dev app/main.py          # http://127.0.0.1:8000/docs

# 2) 프론트엔드 (새 터미널)
cd frontend
python -m http.server 8080       # http://localhost:8080
```

로컬(localhost)에서 열면 실습 페이지가 자동으로 `http://127.0.0.1:8000`의 로컬 백엔드를 호출합니다.

## 배운 점

- 브라우저는 다른 출처(도메인·포트)의 응답을 기본적으로 막기 때문에(CORS), 백엔드가 Vercel 주소를 허용해야 연동됩니다. 허용 주소는 코드가 아닌 환경변수(`ALLOWED_ORIGINS`)로 관리했습니다.
- Pydantic 모델 덕분에 잘못된 입력(음수 금액, 빈 카테고리 등)은 함수 실행 전에 422로 걸러집니다.
- GitHub에 push하면 Vercel과 Render가 자동으로 다시 배포됩니다(CI/CD).
