(function () {
  const revealSelectors = [
    ".animate-on-scroll",
    ".glass-card",
    ".project-catalog-card",
    ".project-filter-dropdown",
    ".project-catalog-actions",
    ".projects-cta-wrap",
    ".project-catalog-tags span",
    "#habilidades .glass-card span",
    "#proyectos .glass-card span",
    "main section h1",
    "main section h2",
    "main section h3",
    ".project-catalog-intro",
    "section > .max-w-6xl > .text-center p",
    "section > .max-w-6xl > .text-center",
    "footer"
  ];

  const revealCandidates = Array.from(
    document.querySelectorAll(revealSelectors.join(","))
  );

  const revealElements = revealCandidates.filter((el) => {
    if (el.matches(".project-catalog-page .project-catalog-card")) {
      const cards = Array.from(
        el.closest(".project-catalog-grid")?.querySelectorAll(".project-catalog-card") || []
      );

      return cards.indexOf(el) < 2;
    }

    if (el.closest(".project-catalog-page .project-catalog-card")) {
      return false;
    }

    return !el.closest("nav") &&
      !el.closest(".mobile-menu-panel") &&
      !el.className.includes("floating-card") &&
      !el.classList.contains("animate-fade-in-up") &&
      !(el.matches("h3") && el.closest(".glass-card, .project-catalog-card"));
  });

  revealElements.forEach((el, index) => {
    if (!el.classList.contains("animate-on-scroll")) {
      el.classList.add("reveal-on-scroll");
    }

    if (
      el.matches("h1, h2, .project-catalog-title") ||
      (el.matches("h3") && !el.closest(".glass-card, .project-catalog-card"))
    ) {
      el.classList.add("reveal-title");
    } else if (el.matches(".inline-flex.glass-card, .project-filter-dropdown")) {
      el.classList.add("reveal-badge");
    } else if (el.matches(".glass-card, .project-catalog-card")) {
      el.classList.add("reveal-card");
    } else if (el.matches("p, .project-catalog-intro")) {
      el.classList.add("reveal-text");
    } else if (el.matches("footer, .project-catalog-actions, .projects-cta-wrap")) {
      el.classList.add("reveal-action");
    }

    if (el.matches(".project-catalog-tags span, #habilidades .glass-card span, #proyectos .glass-card span")) {
      el.classList.add("tech-chip", "reveal-chip");
      el.style.setProperty("--chip-index", `${index % 8}`);
      el.style.setProperty("--reveal-delay", `${(index % 8) * 0.025}s`);
    }

    if (!el.style.getPropertyValue("--reveal-delay")) {
      el.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 0.055}s`);
    }
  });

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const pendingReveal = new Set();
  let revealFrame = null;

  function showElement(el) {
    el.classList.add("visible");
    revealObserver.unobserve(el);
  }

  function flushReveals() {
    pendingReveal.forEach(showElement);
    pendingReveal.clear();
    revealFrame = null;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          pendingReveal.add(entry.target);
        }
      });

      if (pendingReveal.size && !revealFrame) {
        revealFrame = requestAnimationFrame(flushReveals);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  requestAnimationFrame(() => {
    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

      if (isVisible) {
        el.classList.add("visible");
      } else {
        revealObserver.observe(el);
      }
    });
  });

  const interactiveCards = Array.from(
    document.querySelectorAll(".glass-card, .project-catalog-card")
  ).filter((card) =>
    !card.closest("nav") &&
    !card.closest(".project-catalog-page")
  );

  interactiveCards.forEach((card) => {
    let frame = null;

    card.addEventListener("pointermove", (event) => {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);
        frame = null;
      });
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });

  const projectsCarousel = document.querySelector("#proyectos .projects-featured-grid");
  const projectsDots = Array.from(document.querySelectorAll("#proyectos .projects-carousel-dot"));
  const projectSlides = projectsCarousel
    ? Array.from(projectsCarousel.querySelectorAll(":scope > .glass-card"))
    : [];

  if (projectsCarousel && projectsDots.length && projectSlides.length) {
    let activeProjectIndex = projectSlides.findIndex((slide) => slide.classList.contains("is-active"));
    let touchStartX = 0;

    function setActiveProjectDot(activeIndex) {
      projectsDots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }

    function showProjectSlide(index) {
      activeProjectIndex = (index + projectSlides.length) % projectSlides.length;

      projectSlides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeProjectIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      setActiveProjectDot(activeProjectIndex);
    }

    projectsDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showProjectSlide(index);
      });
    });

    projectsCarousel.addEventListener("touchstart", (event) => {
      touchStartX = event.touches[0]?.clientX || 0;
    }, { passive: true });

    projectsCarousel.addEventListener("touchend", (event) => {
      const touchEndX = event.changedTouches[0]?.clientX || 0;
      const deltaX = touchEndX - touchStartX;

      if (Math.abs(deltaX) < 45) return;

      showProjectSlide(activeProjectIndex + (deltaX < 0 ? 1 : -1));
    }, { passive: true });

    showProjectSlide(activeProjectIndex >= 0 ? activeProjectIndex : 0);
  }
})();
