import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import transactions

app = FastAPI(title="지출 관리 API")

# ── CORS: 프론트(Vercel)에서 이 API를 호출할 수 있게 허용 ──
# 허용할 출처는 코드가 아니라 환경변수 ALLOWED_ORIGINS 로 받는다(2주차 워크북 ⑤-② 원칙).
# 배포 시 Render 환경변수에 Vercel 주소(https://….vercel.app, 끝에 / 없이)를 넣는다.
# 여러 개면 쉼표로 구분한다. 값이 없으면 로컬 테스트용 주소만 허용한다.
origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5500,http://127.0.0.1:5500,http://localhost:8080,http://127.0.0.1:8080",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "지출 관리 API에 오신 것을 환영합니다"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(transactions.router)
