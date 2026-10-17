document.addEventListener("DOMContentLoaded", function () {
  var root = document.documentElement;
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* ---- scroll reveal ---- */
  var targets = document.querySelectorAll(
    ".section, .project, .entry, .honor, .club-card, .tl-item, .gallery-item, .cert-mini, .signal"
  );
  targets.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---- lightbox for certificates & paintings ---- */
  var overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = '<span class="lightbox-close">Close ✕</span><img alt="">';
  document.body.appendChild(overlay);
  var overlayImg = overlay.querySelector("img");

  function openLightbox(src, alt) {
    overlayImg.src = src;
    overlayImg.alt = alt || "";
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("img.zoomable").forEach(function (img) {
    img.addEventListener("click", function () {
      openLightbox(img.src, img.alt);
    });
  });
  overlay.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---- theme toggle ---- */
  var btn = document.getElementById("themeToggle");
  function paintBtn() { if (btn) btn.textContent = root.getAttribute("data-theme") === "dark" ? "\u2600" : "\u263E"; }
  paintBtn();
  if (btn) btn.addEventListener("click", function () {
    var t = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    paintBtn();
  });

  /* ---- starfield / golden dust ---- */
  var cv = document.createElement("canvas"); cv.id = "sky"; document.body.prepend(cv);
  var cx = cv.getContext("2d"), W, H, stars = [], shoot = null, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function size() {
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = []; for (var i = 0; i < Math.min(150, W * H / 9000); i++)
      stars.push({ x: Math.random() * W, y: Math.random() * H, r: .4 + Math.random() * 1.4, p: Math.random() * 6.28, s: .5 + Math.random() * 1.5, v: .08 + Math.random() * .2 });
  }
  size(); addEventListener("resize", size);
  function frame(t) {
    cx.clearRect(0, 0, W, H);
    var dark = root.getAttribute("data-theme") === "dark", col = dark ? "255,244,214" : "184,134,43";
    stars.forEach(function (s) {
      var a = dark ? .3 + .7 * (Math.sin(t / 700 * s.s + s.p) + 1) / 2 : .15 + .25 * (Math.sin(t / 900 * s.s + s.p) + 1) / 2;
      if (!dark && !reduced) { s.y -= s.v; if (s.y < -5) s.y = H + 5; }
      cx.fillStyle = "rgba(" + col + "," + a + ")"; cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.28); cx.fill();
    });
    if (dark && !reduced) {
      if (!shoot && Math.random() < .004) shoot = { x: Math.random() * W, y: Math.random() * H * .4, l: 0 };
      if (shoot) {
        var g = cx.createLinearGradient(shoot.x, shoot.y, shoot.x - 80, shoot.y - 40);
        g.addColorStop(0, "rgba(255,244,214,.9)"); g.addColorStop(1, "rgba(255,244,214,0)");
        cx.strokeStyle = g; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(shoot.x, shoot.y); cx.lineTo(shoot.x - 80, shoot.y - 40); cx.stroke();
        shoot.x += 9; shoot.y += 4.5; if (++shoot.l > 70) shoot = null;
      }
    }
    if (!reduced) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---- floating candles ---- */
  var page = document.querySelector(".page");
  if (page) {
    var layer = document.createElement("div"); layer.className = "candle-layer";
    [[5, 60], [17, 150], [30, 40], [62, 90], [76, 30], [88, 140], [95, 70]].forEach(function (p, i) {
      var c = document.createElement("div"); c.className = "candle";
      c.style.left = p[0] + "%"; c.style.top = p[1] + "px"; c.style.animationDelay = (-i * 0.9) + "s";
      c.innerHTML = '<i class="flame"></i><i class="wax"></i>'; layer.appendChild(c);
    });
    page.prepend(layer);
  }

  /* ---- cursor sparkles ---- */
  if (!reduced && window.matchMedia && matchMedia("(pointer: fine)").matches) {
    var last = 0;
    document.addEventListener("mousemove", function (e) {
      var n = Date.now(); if (n - last < 50) return; last = n;
      var s = document.createElement("span"); s.className = "spark"; s.textContent = "\u2726";
      s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
      s.style.fontSize = (8 + Math.random() * 10) + "px"; s.style.setProperty("--dx", (Math.random() * 44 - 22) + "px");
      document.body.appendChild(s); setTimeout(function () { s.remove(); }, 900);
    });
  }
});
