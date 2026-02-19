/* ============================================================
   ALY FLUCKEY — index.js
   Accordion case studies · Rainbow toggle · Nav scroll state
============================================================ */

(function () {
  "use strict";

  /* ============================================================
     UTILITY
  ============================================================ */

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  /* ============================================================
     NAV — add .scrolled class when user scrolls past threshold
  ============================================================ */

  function initNav() {
    var nav = $(".nav");
    if (!nav) return;

    var threshold = 40;

    function onScroll() {
      if (window.scrollY > threshold) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on load in case page is already scrolled

    // Show the nav name once the hero h1 scrolls out of view
    var heroName = $("#hero-name");
    if (heroName && "IntersectionObserver" in window) {
      var nameObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              nav.classList.remove("name-visible");
            } else {
              nav.classList.add("name-visible");
            }
          });
        },
        {
          // Fire as soon as the bottom edge of the h1 leaves the viewport top
          rootMargin: "0px 0px 0px 0px",
          threshold: 0,
        },
      );
      nameObserver.observe(heroName);
    }
  }

  /* ============================================================
     ACCORDION — case studies
  ============================================================ */

  function initAccordion() {
    var triggers = $$(".case-study__trigger");

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var article = trigger.closest(".case-study");
        var bodyId = trigger.getAttribute("aria-controls");
        var body = bodyId ? document.getElementById(bodyId) : null;

        if (!article || !body) return;

        var isOpen = article.classList.contains("is-open");

        if (isOpen) {
          // Close
          collapse(article, trigger, body);
        } else {
          // Close any other open ones first (one-open-at-a-time)
          $$(".case-study.is-open").forEach(function (openArticle) {
            var openTrigger = $(".case-study__trigger", openArticle);
            var openBodyId =
              openTrigger && openTrigger.getAttribute("aria-controls");
            var openBody = openBodyId
              ? document.getElementById(openBodyId)
              : null;
            if (openArticle !== article) {
              collapse(openArticle, openTrigger, openBody);
            }
          });

          // Open this one
          expand(article, trigger, body);
        }
      });

      // Keyboard: also respond to Space and Enter (button already handles Enter,
      // but Space on a <button> is native — this is just belt-and-suspenders)
      trigger.addEventListener("keydown", function (e) {
        if (e.key === " ") {
          e.preventDefault();
          trigger.click();
        }
      });
    });
  }

  function expand(article, trigger, body) {
    article.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");

    if (body) {
      body.removeAttribute("hidden");
      // Scroll newly opened panel into view if it's partly off-screen
      setTimeout(function () {
        var rect = article.getBoundingClientRect();
        var navH = ($(".nav") || {}).offsetHeight || 0;
        if (rect.top < navH + 16) {
          window.scrollBy({
            top: rect.top - navH - 16,
            behavior: "smooth",
          });
        }
      }, 50);
    }
  }

  function collapse(article, trigger, body) {
    article.classList.remove("is-open");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (body) body.setAttribute("hidden", "");
  }

  /* ============================================================
     RAINBOW TOGGLE
  ============================================================ */

  var RAINBOW_KEY = "af-rainbow-mode";

  function initRainbow() {
    var toggles = $$("#rainbowToggle, #rainbowToggleFooter, .rainbow-toggle");

    // Restore preference
    var saved = localStorage.getItem(RAINBOW_KEY);
    if (saved === "true") {
      enableRainbow(toggles, false);
    }

    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isOn = document.body.classList.contains("rainbow-mode");
        if (isOn) {
          disableRainbow(toggles);
        } else {
          enableRainbow(toggles, true);
        }
      });
    });
  }

  function enableRainbow(toggles, save) {
    document.body.classList.add("rainbow-mode");
    toggles.forEach(function (btn) {
      btn.setAttribute("aria-pressed", "true");
    });
    if (save) {
      try {
        localStorage.setItem(RAINBOW_KEY, "true");
      } catch (e) {}
    }
    spawnRainbowBurst();
  }

  function disableRainbow(toggles) {
    document.body.classList.remove("rainbow-mode");
    toggles.forEach(function (btn) {
      btn.setAttribute("aria-pressed", "false");
    });
    try {
      localStorage.setItem(RAINBOW_KEY, "false");
    } catch (e) {}
  }

  /* ============================================================
     RAINBOW BURST — a tiny playful particle effect on toggle
  ============================================================ */

  function spawnRainbowBurst() {
    var colors = [
      "#ff0080",
      "#ff8c00",
      "#ffe600",
      "#00ff88",
      "#00c6ff",
      "#7928ca",
      "#fc00ff",
      "#00dbde",
    ];
    var count = 18;

    for (var i = 0; i < count; i++) {
      (function (index) {
        setTimeout(function () {
          var dot = document.createElement("span");
          dot.setAttribute("aria-hidden", "true");

          var angle = (360 / count) * index;
          var distance = 60 + Math.random() * 40;
          var size = 6 + Math.random() * 6;
          var color = colors[index % colors.length];

          // Starting position — center of viewport
          var cx = window.innerWidth / 2;
          var cy = window.innerHeight / 2;

          Object.assign(dot.style, {
            position: "fixed",
            left: cx + "px",
            top: cy + "px",
            width: size + "px",
            height: size + "px",
            borderRadius: "50%",
            background: color,
            pointerEvents: "none",
            zIndex: "9999",
            transform: "translate(-50%, -50%)",
            transition:
              "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease",
            opacity: "1",
            willChange: "transform, opacity",
          });

          document.body.appendChild(dot);

          // Trigger paint before animating
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              var rad = (angle * Math.PI) / 180;
              var dx = Math.cos(rad) * distance;
              var dy = Math.sin(rad) * distance;
              dot.style.transform =
                "translate(calc(-50% + " +
                dx +
                "px), calc(-50% + " +
                dy +
                "px)) scale(0)";
              dot.style.opacity = "0";
            });
          });

          setTimeout(function () {
            if (dot.parentNode) dot.parentNode.removeChild(dot);
          }, 700);
        }, index * 18);
      })(i);
    }
  }

  /* ============================================================
     SCROLL REVEAL — fade + lift sections in as they enter view
  ============================================================ */

  function initScrollReveal() {
    // Skip if browser doesn't support IntersectionObserver
    if (!("IntersectionObserver" in window)) return;

    var targets = $$(
      ".pillar, .case-study, .seeking-card, .seeking-note, .section__header, .lets-talk__content",
    );

    // Set initial hidden state via inline style so CSS isn't required
    targets.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition =
        "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)";
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ============================================================
     STAGGER — delay each child within a parent group
  ============================================================ */

  function initStagger() {
    var groups = [".pillars", ".seeking-grid", ".case-studies"];

    groups.forEach(function (selector) {
      var parent = $(selector);
      if (!parent) return;
      var children = Array.from(parent.children);
      children.forEach(function (child, i) {
        var current = child.style.transition || "";
        child.style.transitionDelay = i * 0.07 + "s";
        // Reset after reveal so hover transitions feel instant
        child.addEventListener(
          "transitionend",
          function onEnd() {
            child.style.transitionDelay = "0s";
            child.removeEventListener("transitionend", onEnd);
          },
          { once: true },
        );
      });
    });
  }

  /* ============================================================
     ANIMATIONS — pause/resume infinite animations based on visibility
  ============================================================ */

  function initAnimations() {
    if (!("IntersectionObserver" in window)) return;

    // Adds className when el enters the viewport, removes it when it leaves.
    function observeVisibility(el, className) {
      if (!el) return;
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            el.classList.toggle(className, entry.isIntersecting);
          });
        },
        { threshold: 0 },
      ).observe(el);
    }

    // scrollPulse — only animate when the scroll hint is visible
    observeVisibility($(".hero__scroll-line"), "playing");

    // glyphSpin — only run when the glyph is visible
    observeVisibility($(".lets-talk__glyph"), "spinning");
  }

  /* ============================================================
     INIT
  ============================================================ */

  function init() {
    initNav();
    initAccordion();
    initRainbow();
    initScrollReveal();
    initStagger();
    initAnimations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
