// 鼠标光晕
const halo = document.querySelector(".halo");
window.addEventListener("mousemove", (e) => {
  halo.style.left = e.clientX + "px";
  halo.style.top = e.clientY + "px";
});

// 打字机
const el = document.getElementById("type");
if (el) {
  const text = el.getAttribute("data-text") || "";
  let i = 0;
  el.textContent = "";
  const timer = setInterval(() => {
    el.textContent += text[i] || "";
    i++;
    if (i >= text.length) clearInterval(timer);
  }, 55);
}
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href="#"], a[href=""]');
  if (a) e.preventDefault();
});
