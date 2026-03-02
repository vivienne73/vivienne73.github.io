(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // cursor glow
  const glow = $("#cursorGlow");
  if (glow) {
    window.addEventListener("mousemove", (e) => {
      glow.style.left = (e.clientX - 110) + "px";
      glow.style.top = (e.clientY - 110) + "px";
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      glow.style.left = (t.clientX - 110) + "px";
      glow.style.top = (t.clientY - 110) + "px";
    }, { passive: true });
  }

  // scroll reveal
  const revealEls = $$(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) en.target.classList.add("is-in");
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  }

  // night mode
  const modeBtn = $("#modeBtn");
  const setModeText = () => {
    if (!modeBtn) return;
    modeBtn.textContent = document.body.classList.contains("night") ? "day" : "night";
  };

  if (modeBtn) {
    const saved = localStorage.getItem("v_mode");
    if (saved === "night") document.body.classList.add("night");
    setModeText();

    modeBtn.addEventListener("click", () => {
      document.body.classList.toggle("night");
      localStorage.setItem("v_mode", document.body.classList.contains("night") ? "night" : "day");
      setModeText();
    });
  }

  // typewriter (multi states)
  const typeEl = $("#typeText");
  const phrases = [
    "soft pink, soft heart.",
    "glass UI, but real feelings.",
    "leave space. leave light.",
    "make it gentle, make it mine."
  ];
  let p = 0, i = 0, deleting = false;

  function tick() {
    if (!typeEl) return;
    const current = phrases[p];

    if (!deleting) {
      i++;
      typeEl.textContent = current.slice(0, i);
      if (i >= current.length) {
        deleting = true;
        setTimeout(tick, 900);
        return;
      }
    } else {
      i--;
      typeEl.textContent = current.slice(0, i);
      if (i <= 0) {
        deleting = false;
        p = (p + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 35 : 55);
  }
  tick();

  // mood (小随机)
  const moodEl = $("#moodText");
  const moods = ["soft & quiet", "clean & sweet", "pink & calm", "gentle & steady"];
  if (moodEl) moodEl.textContent = moods[Math.floor(Math.random() * moods.length)];

  // note (local storage)
  const noteForm = $("#noteForm");
  const noteName = $("#noteName");
  const noteText = $("#noteText");
  const noteStatus = $("#noteStatus");
  const clearBtn = $("#clearNoteBtn");

  const loadNote = () => {
    const data = localStorage.getItem("v_note");
    if (!data) return;
    try {
      const obj = JSON.parse(data);
      if (noteName) noteName.value = obj.name || "";
      if (noteText) noteText.value = obj.text || "";
      if (noteStatus) noteStatus.textContent = "已恢复上次保存";
    } catch {}
  };

  const saveNote = () => {
    const obj = {
      name: noteName ? noteName.value.trim() : "",
      text: noteText ? noteText.value.trim() : "",
      t: Date.now()
    };
    localStorage.setItem("v_note", JSON.stringify(obj));
    if (noteStatus) noteStatus.textContent = "saved ✓";
    setTimeout(() => { if (noteStatus) noteStatus.textContent = ""; }, 1200);
  };

  const clearNote = () => {
    localStorage.removeItem("v_note");
    if (noteName) noteName.value = "";
    if (noteText) noteText.value = "";
    if (noteStatus) noteStatus.textContent = "cleared";
    setTimeout(() => { if (noteStatus) noteStatus.textContent = ""; }, 1200);
  };

  if (noteForm) {
    loadNote();
    noteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      saveNote();
    });
  }
  if (clearBtn) clearBtn.addEventListener("click", clearNote);
})();
