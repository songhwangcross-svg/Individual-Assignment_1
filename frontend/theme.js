// 다크모드 전환 (1주차 실습의 theme-btn 기능을 두 페이지에서 함께 쓰도록 분리)
const themeBtn = document.getElementById("theme-btn");
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  if (themeBtn) themeBtn.textContent = dark ? "라이트모드" : "다크모드";
}
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
applyTheme(saved === "dark");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark");
    applyTheme(dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
  });
}
