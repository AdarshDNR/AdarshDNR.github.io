// Main JavaScript - Amazon Portfolio Website

/* ============================================
   Task 3.4: Navigation Controller
   ============================================ */

const NavigationController = {
  nav: null,
  links: null,
  hamburger: null,
  navLinksContainer: null,
  sections: [],
  scrollTicking: false,

  init() {
    this.nav = document.getElementById('navbar');
    this.hamburger = document.getElementById('nav-hamburger');
    this.navLinksContainer = document.getElementById('nav-links');
    this.links = document.querySelectorAll('.nav__link');
    this.sections = Array.from(this.links).map(link => {
      const id = link.getAttribute('href').substring(1);
      return document.getElementById(id);
    }).filter(Boolean);

    this.bindEvents();
    this.handleScroll();
  },

  bindEvents() {
    // Smooth scroll on link click
    this.links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        // Close menu BEFORE scrolling so body scroll-lock is released
        this.closeMobileMenu();
        // Small delay so the menu close animation starts first on mobile
        requestAnimationFrame(() => {
          this.smoothScrollTo(targetId);
        });
      });
    });

    // Hamburger toggle
    if (this.hamburger) {
      this.hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }

    // Throttled scroll handler
    window.addEventListener('scroll', () => {
      if (!this.scrollTicking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          this.scrollTicking = false;
        });
        this.scrollTicking = true;
      }
    }, { passive: true });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMobileMenu();
    });

    // Close on resize if we go back to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) this.closeMobileMenu();
    });

    // Close menu when clicking outside of it on mobile
    document.addEventListener('click', (e) => {
      if (!this.isMobileMenuOpen()) return;
      const clickedInsideNav = this.nav && this.nav.contains(e.target);
      if (!clickedInsideNav) this.closeMobileMenu();
    });
  },

  smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const navHeight = this.nav ? this.nav.offsetHeight : 64;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  },

  setActiveLink(sectionId) {
    this.links.forEach(link => {
      const linkTarget = link.getAttribute('href').substring(1);
      if (linkTarget === sectionId) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
      }
    });
  },

  isMobileMenuOpen() {
    return this.hamburger && this.hamburger.getAttribute('aria-expanded') === 'true';
  },

  toggleMobileMenu() {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  },

  openMobileMenu() {
    if (!this.hamburger) return;
    this.hamburger.setAttribute('aria-expanded', 'true');
    this.navLinksContainer.classList.add('nav__links--open');
    document.body.classList.add('body--menu-open');
  },

  closeMobileMenu() {
    if (!this.hamburger) return;
    this.hamburger.setAttribute('aria-expanded', 'false');
    this.navLinksContainer.classList.remove('nav__links--open');
    document.body.classList.remove('body--menu-open');
  },

  handleScroll() {
    const scrollY = window.pageYOffset;
    const navHeight = this.nav ? this.nav.offsetHeight : 64;

    // Toggle scrolled class
    if (scrollY > 100) {
      this.nav.classList.add('nav--scrolled');
    } else {
      this.nav.classList.remove('nav--scrolled');
    }

    // Determine active section
    let currentSection = 'hero';
    for (const section of this.sections) {
      const sectionTop = section.offsetTop - navHeight - 100;
      if (scrollY >= sectionTop) {
        currentSection = section.id;
      }
    }
    this.setActiveLink(currentSection);
  }
};

/* ============================================
   Task 11.1: Animated Metric Counters
   ============================================ */

const CounterAnimation = {
  animated: new Set(),

  init() {
    const elements = document.querySelectorAll('[data-target]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated.has(entry.target)) {
          this.animated.add(entry.target);
          this.animateCounter(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  },

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeOutQuad(progress);
      const current = Math.round(eased * target);

      element.textContent = prefix + this.formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = prefix + this.formatNumber(target) + suffix;
      }
    };

    requestAnimationFrame(step);
  },

  easeOutQuad(t) {
    return t * (2 - t);
  },

  formatNumber(value) {
    return value.toLocaleString('en-US');
  }
};

/* ============================================
   Task 12.3: Staggered Skill Item Animation
   ============================================ */

const SkillsAnimation = {
  init() {
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.skill-item');
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('visible');
            }, index * 50);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(skillsSection);
  }
};

/* ============================================
   Task 13.3: Back-to-Top Button
   ============================================ */

const BackToTop = {
  init() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const hero = document.getElementById('hero');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
};

/* ============================================
   Task 14.1: Scroll Animation System
   ============================================ */

const ScrollAnimations = {
  init() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  }
};

/* ============================================
   Initialization
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Remove no-js class
  document.documentElement.classList.remove('no-js');

  // Initialize navigation
  NavigationController.init();

  // Initialize scroll animations
  ScrollAnimations.init();

  // Initialize counter animations
  CounterAnimation.init();

  // Initialize skills staggered animation
  SkillsAnimation.init();

  // Initialize back-to-top button
  BackToTop.init();
});
