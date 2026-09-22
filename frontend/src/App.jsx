import { useState, useEffect } from "react";

// 백엔드 API 주소 (W2 워크북 ①-③과 같은 방식)
// - 로컬: .env 파일의 VITE_API_URL (없으면 http://localhost:8000)
// - 배포: Vercel 환경변수 VITE_API_URL = Render 주소
// VITE_ 로 시작하는 변수만 브라우저 코드에 전달된다.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const won = (n) => Math.round(n).toLocaleString("ko-KR") + "원";
const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const emptyForm = () => ({ type: "expense", amount: "", category: "", description: "", occurred_on: today() });

export default function App() {
  const [transactions, setTransactions] = useState([]); // 거래 목록 (서버에서 받아 옴)
  const [form, setForm] = useState(emptyForm());        // 입력 폼
  const [status, setStatus] = useState("checking");     // 백엔드 연결 상태: checking | ok | fail
  const [message, setMessage] = useState("");           // 등록·삭제 결과 메시지
  const [logs, setLogs] = useState([]);                  // 요청·응답 로그
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("theme") === "dark"; } catch { return false; }
  });

  // 다크모드: 소개 페이지와 같은 설정(localStorage "theme")을 공유한다
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch { /* 저장 불가 환경 무시 */ }
  }, [dark]);

  const addLog = (line) => {
    const t = new Date().toLocaleTimeString("ko-KR");
    setLogs((prev) => [`[${t}] ${line}`, ...prev]);
  };

  // 모든 API 호출이 지나가는 공통 함수: 요청과 응답을 로그에 남긴다
  const api = async (method, path, body) => {
    const options = { method, headers: {} };
    if (body) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body); // JS 객체 → JSON 문자열
    }
    addLog(`→ ${method} ${path}${body ? " " + JSON.stringify(body) : ""}`);
    const res = await fetch(`${API_URL}${path}`, options);
    const data = res.status === 204 ? null : await res.json(); // JSON → JS 객체
    addLog(`← ${res.status} ${data === null ? "(본문 없음)" : JSON.stringify(data)}`);
    if (!res.ok) {
      const detail = Array.isArray(data?.detail) ? data.detail.map((d) => d.msg).join(", ") : data?.detail;
      throw new Error(`${res.status} ${detail || "요청 실패"}`);
    }
    return data;
  };

  // 목록 조회: GET /transactions
  const loadTransactions = async () => {
    try {
      setTransactions(await api("GET", "/transactions?skip=0&limit=100"));
    } catch (e) {
      setMessage("⚠️ 목록을 불러오지 못했습니다: " + e.message);
    }
  };

  // 처음 화면이 뜨면: 서버 상태 확인(GET /health) → 목록 불러오기
  useEffect(() => {
    (async () => {
      try {
        await api("GET", "/health");
        setStatus("ok");
        loadTransactions();
      } catch {
        setStatus("fail");
      }
    })();
  }, []);

  // 등록: POST /transactions → 성공하면 서버에서 목록을 다시 받아 온다 (W2 ③-④와 같은 방식)
  const addTransaction = async (e) => {
    e.preventDefault();
    try {
      const created = await api("POST", "/transactions", {
        type: form.type,
        amount: Number(form.amount),
        category: form.category.trim(),
        description: form.description.trim() || null,
        occurred_on: form.occurred_on,
      });
      setMessage(`✅ ${created.id}번 거래가 등록되었습니다 (201 Created)`);
      setForm(emptyForm());
      loadTransactions();
    } catch (err) {
      setMessage("⚠️ 등록 실패: " + err.message);
    }
  };

  // 삭제: DELETE /transactions/{id}
  const deleteTransaction = async (id) => {
    try {
      await api("DELETE", `/transactions/${id}`);
      setMessage(`🗑️ ${id}번 거래를 삭제했습니다 (204 No Content)`);
      loadTransactions();
    } catch (err) {
      setMessage("⚠️ 삭제 실패: " + err.message);
    }
  };

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const onChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <header className="topbar">
        <span className="brand">송수원</span>
        <nav>
          <a href="/intro/">소개</a>
          <a href="/" className="active">API 연동 실습</a>
          <button onClick={() => setDark(!dark)}>{dark ? "라이트모드" : "다크모드"}</button>
        </nav>
      </header>

      <main>
        {/* 1. 연결 상태 */}
        <section className="card">
          <h2>💰 가계부 — 프론트엔드·백엔드 연동 실습</h2>
          <p className="muted">
            React(Vite) 화면이 Render에 배포한 FastAPI 가계부 API(3주차 실습)를 <code>fetch</code>로 호출하고 결과를 보여 줍니다.
          </p>
          <div className="status">
            <span className={`dot ${status}`}></span>
            {status === "checking" && "백엔드 연결 확인 중… (Render 무료 플랜은 첫 접속에 최대 1분 걸립니다)"}
            {status === "ok" && "백엔드 연결됨 (GET /health → 200 OK)"}
            {status === "fail" && "백엔드에 연결하지 못했습니다 (주소·CORS 설정을 확인하세요)"}
          </div>
          <p className="status muted">
            API 주소: <code>{API_URL}</code> ·{" "}
            <a href={`${API_URL}/docs`} target="_blank" rel="noopener">Swagger UI(/docs) 열기</a>
          </p>
        </section>

        {/* 2. 동작 흐름 */}
        <section className="card">
          <h2>이 페이지는 이렇게 동작합니다</h2>
          <div className="flow">
            <span className="box">브라우저</span> →
            <span className="box">프론트엔드 (Vercel · React)</span> → fetch →
            <span className="box">FastAPI 백엔드 (Render)</span> → JSON 응답 → 화면 갱신
          </div>
          <ol className="steps">
            <li><span className="when">① 페이지가 열리면</span><span><code>GET /health</code>로 서버 상태 확인 → <code>GET /transactions</code>로 목록 불러오기</span></li>
            <li><span className="when">② 등록 버튼</span><span><code>POST /transactions</code> → 성공 시 <code>201 Created</code></span></li>
            <li><span className="when">③ 삭제 버튼</span><span><code>DELETE /transactions/{"{id}"}</code> → 성공 시 <code>204 No Content</code></span></li>
            <li><span className="when">④ 결과 확인</span><span>맨 아래 <b>요청·응답 로그</b>에서 실제로 주고받은 요청과 응답(상태 코드)을 확인</span></li>
          </ol>
        </section>

        {/* 3. 거래 등록 → POST /transactions */}
        <section className="card">
          <h2>거래 등록 <span className="sub">POST /transactions</span></h2>
          <form className="tx-form" onSubmit={addTransaction}>
            <label>구분
              <select value={form.type} onChange={onChange("type")}>
                <option value="expense">지출</option>
                <option value="income">수입</option>
              </select>
            </label>
            <label>금액(원)
              <input type="number" min="1" step="1" placeholder="12000" required value={form.amount} onChange={onChange("amount")} />
            </label>
            <label>카테고리
              <input maxLength={50} placeholder="식비" required value={form.category} onChange={onChange("category")} />
            </label>
            <label>메모(선택)
              <input maxLength={200} placeholder="점심" value={form.description} onChange={onChange("description")} />
            </label>
            <label>날짜
              <input type="date" required value={form.occurred_on} onChange={onChange("occurred_on")} />
            </label>
            <button className="primary" type="submit">등록</button>
          </form>
          <p className="msg">{message}</p>
        </section>

        {/* 4. 합계 + 목록 → GET /transactions, DELETE /transactions/{id} */}
        <section className="card">
          <h2>거래 목록 <span className="sub">GET /transactions</span></h2>
          <div className="stats">
            <div className="stat"><div className="label">수입 합계</div><div className="value income">{won(income)}</div></div>
            <div className="stat"><div className="label">지출 합계</div><div className="value expense">{won(expense)}</div></div>
            <div className="stat"><div className="label">잔액</div><div className="value">{won(income - expense)}</div></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>날짜</th><th>구분</th><th>카테고리</th><th>메모</th><th className="num">금액</th><th></th></tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr><td colSpan="7" className="muted">
                    {status === "ok" ? "아직 거래가 없습니다. 위에서 등록해 보세요." : "백엔드에 연결되면 목록이 표시됩니다."}
                  </td></tr>
                )}
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.occurred_on}</td>
                    <td>{t.type === "income" ? "수입" : "지출"}</td>
                    <td>{t.category}</td>
                    <td>{t.description || "-"}</td>
                    <td className={`num ${t.type}`}>{t.type === "income" ? "+" : "-"}{won(t.amount)}</td>
                    <td><button className="small" onClick={() => deleteTransaction(t.id)}>삭제</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p><button onClick={loadTransactions}>목록 새로고침</button></p>
        </section>

        {/* 5. 요청·응답 로그 */}
        <section className="card">
          <h2>요청·응답 로그</h2>
          <pre className="log">{logs.join("\n")}</pre>
        </section>
      </main>

      <footer>© 2026 송수원 · <a href="/intro/">개인 소개 페이지로 돌아가기</a></footer>
    </>
  );
}
