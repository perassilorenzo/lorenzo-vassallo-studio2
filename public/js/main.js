/* =========================================================
   Lorenzo Vassallo Studio — bozza 01
   Interazioni: reveal, sticky storytelling, parallasse, nav, form demo.
   Nessuna dipendenza esterna.
   ========================================================= */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smallScreenQuery = window.matchMedia("(max-width: 680px)");
  const isSmallScreen = function () { return smallScreenQuery.matches; };

  /* ---------- Header + menu mobile ---------- */
  const header = document.getElementById("site-header");
  const hero = document.getElementById("hero");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");
  let lastScrollY = window.scrollY;
  let headerHidden = false;

  /* ---------- Intro: progresso dello scroll che apre la scena ---------- */
  const introStage = document.getElementById("intro-stage");

  function updateIntro() {
    if (!introStage || !hero || reduceMotion || isSmallScreen()) return;
    const span = Math.max(hero.offsetHeight, 1);
    const progress = Math.max(0, Math.min(1, window.scrollY / span));
    introStage.style.setProperty("--p", progress.toFixed(4));
  }

  function syncHeader() {
    if (!header || !hero) return;
    const threshold = hero.offsetTop + hero.offsetHeight - 90;
    const y = window.scrollY;
    const wasStuck = header.classList.contains("is-stuck");
    const stuck = y > threshold || (wasStuck && y > 2);
    header.classList.toggle("is-stuck", stuck);

    const delta = y - lastScrollY;
    if (!stuck || header.classList.contains("is-nav-open")) {
      headerHidden = false;
      lastScrollY = y;
    } else if (Math.abs(delta) > 4) {
      headerHidden = delta > 0;
      lastScrollY = y;
    }
    header.classList.toggle("is-hidden", headerHidden);
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      const open = header.classList.toggle("is-nav-open");
      if (open) {
        header.classList.add("is-stuck");
        header.classList.remove("is-hidden");
        headerHidden = false;
      }
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  function closeNav() {
    if (!header || !menuToggle) return;
    header.classList.remove("is-nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Apri menu");
  }

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Sticky storytelling: evidenzia la causa attiva ---------- */
  const storyItems = document.querySelectorAll("[data-story-item]");
  let activeStoryIndex = -1;

  function updateStory() {
    if (!storyItems.length) return;
    const viewportCenter = window.innerHeight / 2;
    let closest = 0;
    let minDistance = Infinity;

    storyItems.forEach(function (item, index) {
      const rect = item.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closest = index;
      }
    });

    if (closest === activeStoryIndex) return;
    activeStoryIndex = closest;

    storyItems.forEach(function (item, index) {
      item.classList.toggle("is-active", index === closest);
    });
  }

  /* ---------- Parallasse leggero ---------- */
  const parallaxItems = Array.prototype.map.call(
    document.querySelectorAll("[data-parallax]"),
    function (el) {
      return {
        el: el,
        target: el.querySelector("img") || el,
        speed: parseFloat(el.dataset.speed || "0.05")
      };
    }
  );

  function updateParallax() {
    if (reduceMotion || isSmallScreen()) return;
    const viewportCenter = window.innerHeight / 2;

    parallaxItems.forEach(function (item) {
      const rect = item.el.getBoundingClientRect();
      const delta = viewportCenter - (rect.top + rect.height / 2);
      const offset = Math.max(-80, Math.min(80, delta * item.speed));
      item.target.style.transform = "translate3d(0, " + offset.toFixed(2) + "px, 0)";
    });
  }

  /* ---------- Loop unico, throttled con requestAnimationFrame ---------- */
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      syncHeader();
      updateIntro();
      updateStory();
      updateParallax();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Form dimostrativo ---------- */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");

  if (form && status) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      status.textContent = form.checkValidity()
        ? "Form dimostrativo — collegare l’endpoint di invio."
        : "Compila i campi obbligatori per procedere.";
    });
  }
})();
