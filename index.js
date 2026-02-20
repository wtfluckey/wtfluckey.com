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
     SCROLL REVEAL — fade + lift sections in as they enter view
  ============================================================ */

  function initScrollReveal() {
    // Skip if browser doesn't support IntersectionObserver
    if (!("IntersectionObserver" in window)) return;

    var targets = $$(
      ".pillar, .case-study, .section__header, .lets-talk__content",
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
    var groups = [".pillars", ".case-studies"];

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

    // glyphSpin — only run when the glyph is visible
    observeVisibility($(".lets-talk__glyph"), "playing");
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
