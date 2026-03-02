(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ===== 基础 =====
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== 鼠标光晕跟随 =====
  const root = document.documentElement;
  const moveGlow = (x, y) => {
    root.style.setProperty("--mx", `${x}px`);
    root.style.setProperty("--my", `${y}px`);
  };
  window.addEventListener("mousemove", (e) => moveGlow(e.clientX, e.clientY), { passive: true });
  // 触摸设备：用中心点
  window.addEventListener("touchmove", (e) => {
    const t = e.touches && e.touches[0];
    if (t) moveGlow(t.clientX, t.clientY);
  }, { passive: true });

  // ===== 深夜模式 =====
  const nightBtn = $("#nightBtn");
  const savedTheme = localStorage.getItem("viv_theme");
  if (savedTheme === "night") {
    root.setAttribute("data-theme", "night");
    if (nightBtn) nightBtn.setAttribute("aria-pressed", "true");
  }
  if (nightBtn) {
    nightBtn.addEventListener("click", () => {
      const isNight = root.getAttribute("data-theme") === "night";
      if (isNight) {
        root.removeAttribute("data-theme");
        localStorage.setItem("viv_theme", "light");
        nightBtn.setAttribute("aria-pressed", "false");
      } else {
        root.setAttribute("data-theme", "night");
        localStorage.setItem("viv_theme", "night");
        nightBtn.setAttribute("aria-pressed", "true");
      }
    });
  }

  // ===== Scroll reveal（淡入动画） =====
  const revealEls = $$(".reveal");
  const io = new IntersectionObserver((entries) => {
    for (const ent of entries) {
      if (ent.isIntersecting) {
        ent.target.classList.add("is-visible");
        io.unobserve(ent.target);
      }
    }
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // ===== 图片错误兜底：如果 photo3/photo4 没放，会自动换成占位图 =====
  const placeholderSVG = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#ffd6e8" stop-opacity=".55"/>
          <stop offset="1" stop-color="#dcd4ff" stop-opacity=".55"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="750" fill="url(#g)"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="Inter, Arial" font-size="44" fill="rgba(30,30,40,.45)">
        add your photo here
      </text>
    </svg>
  `.trim());
  const placeholderURL = `data:image/svg+xml;charset=UTF-8,${placeholderSVG}`;

  $$(".ph__img").forEach(img => {
    img.addEventListener("error", () => { img.src = placeholderURL; }, { once: true });
  });

  // ===== Lightbox（点图放大） =====
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbClose = $("#lbClose");

  const openLB = (src) => {
    if (!lb || !lbImg) return;
    lbImg.src = src;
    lb.classList.add("show");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeLB = () => {
    if (!lb || !lbImg) return;
    lb.classList.remove("show");
    lb.setAttribute("aria-hidden", "true");
    lbImg.src = "";
    document.body.style.overflow = "";
  };

  $$(".ph").forEach(btn => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-zoom");
      if (src) openLB(src);
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLB);
  if (lb) lb.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLB(); });

  // ===== Note（本地保存） =====
  const noteInput = $("#noteInput");
  const saveBtn = $("#saveNoteBtn");
  const clearBtn = $("#clearNoteBtn");
  const saveHint = $("#saveHint");
  const noteKey = "viv_note";

  if (noteInput) {
    noteInput.value = localStorage.getItem(noteKey) || "";
  }
  if (saveBtn && noteInput) {
    saveBtn.addEventListener("click", () => {
      localStorage.setItem(noteKey, noteInput.value);
      if (saveHint) {
        saveHint.textContent = "saved ✓";
        setTimeout(() => (saveHint.textContent = "自动保存在浏览器（localStorage）"), 1200);
      }
    });
  }
  if (clearBtn && noteInput) {
    clearBtn.addEventListener("click", () => {
      noteInput.value = "";
      localStorage.removeItem(noteKey);
      if (saveHint) {
        saveHint.textContent = "cleared";
        setTimeout(() => (saveHint.textContent = "自动保存在浏览器（localStorage）"), 1200);
      }
    });
  }

  // 跳到 note
  const noteJumpBtn = $("#noteJumpBtn");
  if (noteJumpBtn) {
    noteJumpBtn.addEventListener("click", () => {
      const sec = $("#hello");
      if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => noteInput && noteInput.focus(), 450);
    });
  }

  // ===== 打字机（固定高度，不抖动） =====
  const typeEl = $("#typeText");
  const lines = [
    "this place is only about me.",
    "soft, sweet, and a little shy.",
    "pink & white — like a gentle night.",
    "enter slowly. stay softly."
  ];

  let li = 0;
  let ci = 0;
  let deleting = false;

  // 关键：给 typeEl 固定最小宽度/高度的“占位”，避免抖动（尤其在空字符串时）
  if (typeEl) {
    typeEl.style.display = "inline-block";
    typeEl.style.minWidth = "18ch";
  }

  function tick() {
    if (!typeEl) return;

    const current = lines[li];
    if (!deleting) {
      ci++;
      typeEl.textContent = current.slice(0, ci);
      if (ci >= current.length) {
        deleting = true;
        setTimeout(tick, 1100);
        return;
      }
      setTimeout(tick, 55);
    } else {
      ci--;
      typeEl.textContent = current.slice(0, Math.max(0, ci));
      if (ci <= 0) {
        deleting = false;
        li = (li + 1) % lines.length;
        setTimeout(tick, 260);
        return;
      }
      setTimeout(tick, 28);
    }
  }
  tick();

  // ===== 背景音乐（点击 enter 后播放，避免被拦截） =====
  const entry = $("#entry");
  const enterBtn = $("#enterBtn");
  const muteBtn = $("#muteBtn");
  const bgm = $("#bgm");

  let musicOn = false;

  function updateMusicUI() {
    if (!muteBtn) return;
    muteBtn.textContent = musicOn ? "music: on" : "music: off";
    muteBtn.setAttribute("aria-pressed", musicOn ? "true" : "false");
  }

  async function setMusic(on) {
    if (!bgm) return;
    musicOn = on;
    localStorage.setItem("viv_music", on ? "on" : "off");
    updateMusicUI();

    try {
      if (on) {
        bgm.volume = 0.32;
        await bgm.play();
      } else {
        bgm.pause();
      }
    } catch (e) {
      // 如果浏览器仍拦截，保持 off
      musicOn = false;
      localStorage.setItem("viv_music", "off");
      updateMusicUI();
    }
  }

  // 记住音乐开关
  const savedMusic = localStorage.getItem("viv_music");
  if (savedMusic === "on") {
    // 不自动播放，等 enter 点击时再尝试播放（更稳）
    musicOn = true;
    updateMusicUI();
  } else {
    musicOn = false;
    updateMusicUI();
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", async () => {
      await setMusic(!musicOn);
    });
  }

  if (enterBtn) {
    enterBtn.addEventListener("click", async () => {
      // 开场退场
      if (entry) {
        entry.classList.add("is-leaving");
        setTimeout(() => {
          entry.style.display = "none";
          entry.setAttribute("aria-hidden", "true");
        }, 720);
      }

      // 如果用户之前选择 music on，则进入时尝试播放
      const wantOn = (localStorage.getItem("viv_music") === "on") || musicOn;
      if (wantOn) {
        await setMusic(true);
      }
    });
  }

  // ===== 防止某些浏览器在打开本地 file:// 时缓存旧内容：提示用户用 http.server 更稳 =====
  //（不弹窗，避免烦）
})();