/* ==========================================================================
   Steep – منطق برنامه
   فهرست:
   1) ابزارهای کمکی و ذخیره‌سازی
   2) وضعیت برنامه (state) و المان‌های صفحه
   3) تم (روشن / تاریک)
   4) زمان‌سنج
   5) انتخاب نوع چای
   6) شمارندهٔ فنجان‌ها
   7) لیست کارها
   8) اجرای اولیه
   ========================================================================== */

/* کل کد داخل یک تابع بلافاصله‌اجراشونده (IIFE) است
   تا متغیرها وارد scope سراسری نشوند و با کدهای دیگر تداخل نکنند */
(() => {

  /* ========================================================================
     1) ابزارهای کمکی و ذخیره‌سازی
     ======================================================================== */

  // میان‌بر برای document.getElementById
  const $ = (id) => document.getElementById(id);

  // ذخیره و خواندن از localStorage (حافظهٔ مرورگر)
  // try/catch گذاشته شده تا اگر localStorage در دسترس نبود برنامه خراب نشود
  const store = {
    get(k, fallback) {
      try {
        return JSON.parse(localStorage.getItem(k)) ?? fallback;  // اگر چیزی ذخیره نشده بود، مقدار پیش‌فرض
      } catch {
        return fallback;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch {}
    }
  };


  /* ========================================================================
     2) وضعیت برنامه (state) و المان‌های صفحه
     ======================================================================== */

  const root = document.documentElement;  // تگ <html>؛ تم روی همین ست می‌شود

  // اسم نمایشی هر چای (برای پیام‌های وضعیت)
  const names = {
    green: "Green tea",
    black: "Black tea",
    herbal: "Herbal tea"
  };

  // وضعیت فعلی تایمر
  const state = {
    key: "green",       // چای انتخاب‌شده
    total: 25 * 60,     // کل زمان (ثانیه)
    left: 25 * 60,      // زمان باقی‌مانده (ثانیه)
    endAt: 0,           // لحظهٔ پایان تایمر (میلی‌ثانیه)
    timer: null         // شناسهٔ setInterval؛ اگر null باشد یعنی تایمر روشن نیست
  };

  // همهٔ المان‌های لازم یک‌بار پیدا و اینجا نگه داشته می‌شوند
  const els = {
    // زمان‌سنج
    time: $("time"),
    status: $("status"),
    glass: $("glass"),
    start: $("start"),
    reset: $("reset"),

    // انتخاب چای و فنجان‌ها
    brews: $("brews"),
    count: $("cupCount"),
    row: $("cupRow"),

    // لیست کارها
    form: $("taskForm"),
    input: $("taskInput"),
    err: $("taskErr"),
    tasks: $("tasks"),
    empty: $("empty")
  };


  /* ========================================================================
     3) تم (روشن / تاریک)
     اولویت: تمِ ذخیره‌شده ← تم سیستم کاربر ← روشن
     ======================================================================== */

  const saved = store.get("steep-theme", null);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  setTheme(saved || (prefersDark ? "dark" : "light"));

  // تم را روی صفحه اعمال می‌کند و متن دکمه را عوض می‌کند
  function setTheme(t) {
    root.dataset.theme = t;  // CSS با data-theme تم را عوض می‌کند
    $("theme").textContent = t === "dark" ? "Light mode" : "Dark mode";
  }

  // کلیک روی دکمهٔ تم: عوض کن و برای دفعهٔ بعد ذخیره کن
  $("theme").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
    store.set("steep-theme", next);
  });


  /* ========================================================================
     4) زمان‌سنج
     ======================================================================== */

  // ثانیه را به فرمت mm:ss تبدیل می‌کند؛ مثلاً 65 → "01:05"
  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // نمایش را با state هماهنگ می‌کند: متن زمان، رنگ چای و عنوان تب مرورگر
  function render() {
    els.time.textContent = fmt(state.left);

    // --p بین 0 و 1 است؛ CSS با آن رنگ چای را پررنگ می‌کند
    els.glass.style.setProperty("--p", (1 - state.left / state.total).toFixed(3));

    // وقتی تایمر روشن است زمان در عنوان تب هم نشان داده می‌شود
    document.title = state.timer
      ? `${fmt(state.left)} – Steep`
      : "Steep – a focus timer shaped like a glass of tea";
  }

  // دکمهٔ Start: اگر تایمر روشن بود متوقفش می‌کند، وگرنه شروعش می‌کند
  function start() {
    if (state.timer) return pause();

    if (state.left === 0) state.left = state.total;  // بعد از اتمام، دوباره از اول

    // به‌جای کم کردن ثانیه‌ها، «لحظهٔ پایان» را ذخیره می‌کنیم
    // تا اگر تب مرورگر کند شد زمان اشتباه نشود
    state.endAt = Date.now() + state.left * 1000;
    state.timer = setInterval(tick, 250);  // هر 250 میلی‌ثانیه چک می‌کند

    els.glass.classList.add("running");  // بخار شروع می‌شود
    els.start.textContent = "Pause";
    els.status.textContent = `${names[state.key]} is steeping.`;
    render();
  }

  // توقف موقت
  function pause() {
    clearInterval(state.timer);
    state.timer = null;

    els.glass.classList.remove("running");
    els.start.textContent = "Resume";
    els.status.textContent = "Paused. Your tea will wait.";
    render();
  }

  // بازگشت به ابتدای همان چای
  function reset() {
    clearInterval(state.timer);
    state.timer = null;
    state.left = state.total;

    els.glass.classList.remove("running");
    els.start.textContent = "Start";
    els.status.textContent = `${names[state.key]}, ready when you are.`;
    render();
  }

  // در هر دور interval اجرا می‌شود: زمان باقی‌مانده را حساب می‌کند
  function tick() {
    state.left = Math.max(0, Math.round((state.endAt - Date.now()) / 1000));
    render();
    if (state.left === 0) finish();
  }

  // وقتی زمان تمام شد
  function finish() {
    clearInterval(state.timer);
    state.timer = null;

    els.glass.classList.remove("running");
    els.start.textContent = "Start again";

    if (state.key === "herbal") {
      // چای گیاهی استراحت است و فنجان حساب نمی‌شود
      els.status.textContent = "Break over. Pick a brew when you're ready.";
    } else {
      addCup();
      els.status.textContent = "Your tea is ready. That's one more cup.";
    }

    chime();
    render();
  }

  // صدای پایان؛ با Web Audio API دو نت پشت‌سرهم می‌سازد (بدون فایل صوتی)
  function chime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      [660, 880].forEach((f, i) => {
        const o = ctx.createOscillator();  // تولید موج صوتی
        const g = ctx.createGain();        // کنترل بلندی صدا

        o.frequency.value = f;             // فرکانس نت
        o.connect(g);
        g.connect(ctx.destination);

        const t = ctx.currentTime + i * 0.25;  // نت دوم 0.25 ثانیه دیرتر

        // بلندی صدا: شروع آرام ← اوج ← محو شدن
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.2, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

        o.start(t);
        o.stop(t + 0.65);
      });
    } catch {}
  }

  // اتصال دکمه‌ها
  els.start.addEventListener("click", start);
  els.reset.addEventListener("click", reset);


  /* ========================================================================
     5) انتخاب نوع چای
     یک listener روی کل گروه گذاشته شده (event delegation)
     ======================================================================== */

  els.brews.addEventListener("click", (e) => {
    // نزدیک‌ترین دکمه‌ای که روی آن کلیک شده (حتی اگر روی strong یا span کلیک شود)
    const b = e.target.closest("button[role=radio]");
    if (!b) return;

    // فقط دکمهٔ انتخاب‌شده aria-checked="true" می‌گیرد
    els.brews.querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", x === b));

    // مقدارها را از data-attributeهای HTML می‌خوانیم
    state.key = b.dataset.key;
    state.total = Number(b.dataset.min) * 60;

    reset();  // تایمر با مدت جدید از اول
  });


  /* ========================================================================
     6) شمارندهٔ فنجان‌ها
     هر روز از صفر شروع می‌شود
     ======================================================================== */

  // تاریخ امروز به شکل "2026-10-27"
  const today = () => new Date().toISOString().slice(0, 10);

  let cups = store.get("steep-cups", { day: today(), n: 0 });

  // اگر تاریخ ذخیره‌شده مال دیروز (یا قبل‌تر) بود، شمارنده ریست می‌شود
  if (cups.day !== today()) cups = { day: today(), n: 0 };

  // عدد و آیکن فنجان‌ها را نشان می‌دهد (حداکثر 24 آیکن)
  function renderCups() {
    els.count.textContent = cups.n;
    els.row.replaceChildren(
      ...Array.from({ length: Math.min(cups.n, 24) }, () => document.createElement("i"))
    );
  }

  // یک فنجان اضافه می‌کند و ذخیره می‌کند
  function addCup() {
    cups.n += 1;
    store.set("steep-cups", cups);
    renderCups();
  }


  /* ========================================================================
     7) لیست کارها
     هر کار یک شیء است: { id, text, done }
     ======================================================================== */

  let tasks = store.get("steep-tasks", []);

  // ذخیرهٔ لیست در مرورگر
  const save = () => store.set("steep-tasks", tasks);

  // کل لیست را از روی آرایهٔ tasks دوباره می‌سازد
  function renderTasks() {
    els.tasks.replaceChildren(
      ...tasks.map((t) => {
        const li = document.createElement("li");
        li.className = t.done ? "done" : "";

        // چک‌باکس: تغییرش وضعیت done را ذخیره می‌کند
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = t.done;
        cb.id = "t" + t.id;
        cb.addEventListener("change", () => {
          t.done = cb.checked;
          save();
          renderTasks();
        });

        // متن کار؛ htmlFor آن را به چک‌باکس وصل می‌کند (کلیک روی متن = کلیک روی چک‌باکس)
        // textContent استفاده شده (نه innerHTML) تا کد HTML کاربر اجرا نشود
        const lb = document.createElement("label");
        lb.htmlFor = cb.id;
        lb.textContent = t.text;

        // دکمهٔ حذف
        const del = document.createElement("button");
        del.type = "button";
        del.textContent = "Delete";
        del.setAttribute("aria-label", `Delete task: ${t.text}`);
        del.addEventListener("click", () => {
          tasks = tasks.filter((x) => x.id !== t.id);  // همهٔ کارها به‌جز این یکی
          save();
          renderTasks();
        });

        li.append(cb, lb, del);
        return li;
      })
    );

    // پیام «لیست خالی» فقط وقتی دیده می‌شود که کاری وجود نداشته باشد
    els.empty.hidden = tasks.length > 0;
  }

  // ثبت کار جدید
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();  // جلوی رفرش شدن صفحه را می‌گیرد

    const text = els.input.value.trim();

    // اگر خالی بود: خطا نشان بده و فوکوس را برگردان به input
    if (!text) {
      els.err.textContent = "Enter a task first.";
      els.input.focus();
      return;
    }

    els.err.textContent = "";
    tasks.push({ id: Date.now(), text, done: false });  // id یکتا از روی زمان
    els.input.value = "";
    save();
    renderTasks();
  });

  // به‌محض شروع تایپ، پیام خطا پاک می‌شود
  els.input.addEventListener("input", () => {
    els.err.textContent = "";
  });


  /* ========================================================================
     8) اجرای اولیه
     بعد از لود صفحه، همه‌چیز یک‌بار از روی داده‌های ذخیره‌شده رسم می‌شود
     ======================================================================== */

  renderCups();
  renderTasks();
  render();

})();
