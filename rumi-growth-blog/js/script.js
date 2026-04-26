const navToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navIndicator = navLinks ? document.createElement("span") : null;
let setNavIndicatorTarget = () => {};

if (!prefersReducedMotion) {
  requestAnimationFrame(() => {
    document.body.classList.add("page-ready");
  });
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navLinks.classList.toggle("open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("open");
      document.body.classList.remove("nav-open");
    });
  });
}

if (navLinks && navIndicator) {
  navIndicator.className = "nav-indicator";
  navIndicator.setAttribute("aria-hidden", "true");
  navLinks.prepend(navIndicator);

  const navItems = Array.from(navLinks.querySelectorAll("a"));
  let activeItem = navLinks.querySelector("a.active") || navItems[0];

  const moveNavIndicator = (item) => {
    if (!item || window.matchMedia("(max-width: 760px)").matches) return;
    navIndicator.style.width = `${item.offsetWidth}px`;
    navIndicator.style.transform = `translate3d(${item.offsetLeft}px, -50%, 0)`;
    navIndicator.style.opacity = "1";
  };

  requestAnimationFrame(() => moveNavIndicator(activeItem));

  setNavIndicatorTarget = (item) => {
    if (!item || !navItems.includes(item)) return;
    activeItem = item;
    navItems.forEach((navItem) => navItem.classList.toggle("active", navItem === item));
    moveNavIndicator(activeItem);
  };

  navItems.forEach((item) => {
    item.addEventListener("mouseenter", () => moveNavIndicator(item));
    item.addEventListener("focus", () => moveNavIndicator(item));
    item.addEventListener("click", () => setNavIndicatorTarget(item));
  });

  navLinks.addEventListener("mouseleave", () => moveNavIndicator(activeItem));
  navLinks.addEventListener("focusout", (event) => {
    if (!navLinks.contains(event.relatedTarget)) moveNavIndicator(activeItem);
  });

  window.addEventListener("resize", () => moveNavIndicator(activeItem));
}

const filterButtons = document.querySelectorAll("[data-filter]");
const blogCards = document.querySelectorAll("[data-category]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });

    blogCards.forEach((card) => {
      const show = filter === "All" || card.dataset.category === filter;
      card.hidden = !show;
    });
  });
});

const progressBar = document.querySelector(".progress-bar");

if (progressBar) {
  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

document.querySelectorAll(".copy-quote").forEach((button) => {
  button.addEventListener("click", async () => {
    const quoteCard = button.closest(".quote-card");
    const quoteText = quoteCard?.querySelector("blockquote")?.innerText.trim();
    if (!quoteText) return;

    try {
      await navigator.clipboard.writeText(quoteText);
      const oldText = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = oldText;
      }, 1500);
    } catch {
      button.textContent = "Copy unavailable";
      setTimeout(() => {
        button.textContent = "Copy Teaching";
      }, 1500);
    }
  });
});

document.querySelectorAll(".reflection-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.getAttribute("aria-controls"));
    if (!target) return;

    const isHidden = target.hidden;
    target.hidden = !isHidden;
    button.setAttribute("aria-expanded", String(isHidden));
    button.textContent = isHidden ? "Hide Reflection Exercise" : "Show Reflection Exercise";
  });
});

if (!prefersReducedMotion) {
  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      const url = new URL(href, window.location.href);
      const isSameOrigin = url.origin === window.location.origin;
      const isPageLink = url.pathname.endsWith(".html") || !url.pathname.includes(".");
      const isCurrentAnchor = url.pathname === window.location.pathname && url.hash;

      if (!isSameOrigin || !isPageLink || isCurrentAnchor) return;

      event.preventDefault();
      if (navLinks?.contains(link)) setNavIndicatorTarget(link);
      document.body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
      navLinks?.classList.remove("open");
      document.body.classList.add("page-leaving");

      window.setTimeout(() => {
        window.location.href = url.href;
      }, 280);
    });
  });
}
