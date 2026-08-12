/**
 * <purelane-hero-stage> — the hero's 1/2/3-product price-tier carousel.
 * Ported from purelane-homepage.html's hstage/hslide/hdots script
 * (auto-advance, pause on hover/focus, pause off-screen, dot nav),
 * rewritten as a custom element so it initializes and tears down
 * cleanly whenever the theme editor re-renders this section.
 */
class PurelaneHeroStage extends HTMLElement {
  constructor() {
    super();
    this.activeIndex = 0;
    this.timer = null;
    this.observer = null;
    this.onDotClick = this.onDotClick.bind(this);
    this.onMouseEnter = this.pause.bind(this);
    this.onMouseLeave = this.play.bind(this);
  }

  connectedCallback() {
    this.slides = Array.from(this.querySelectorAll('.purelane-hero__slide'));
    this.dots = Array.from(this.querySelectorAll('.purelane-hero__dots button'));
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.slides.length < 2) return;

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.onDotClick(index));
    });
    this.addEventListener('mouseenter', this.onMouseEnter);
    this.addEventListener('mouseleave', this.onMouseLeave);

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => (entry.isIntersecting ? this.play() : this.pause())),
        { threshold: 0.2 }
      );
      this.observer.observe(this);
    } else {
      this.play();
    }
  }

  disconnectedCallback() {
    this.pause();
    if (this.observer) this.observer.disconnect();
  }

  onDotClick(index) {
    this.pause();
    this.goTo(index);
    this.play();
  }

  goTo(index) {
    this.activeIndex = (index + this.slides.length) % this.slides.length;
    this.slides.forEach((slide, i) => slide.classList.toggle('is-active', i === this.activeIndex));
    this.dots.forEach((dot, i) => dot.classList.toggle('is-active', i === this.activeIndex));
  }

  play() {
    if (this.timer || this.reduceMotion || this.slides.length < 2) return;
    this.timer = setInterval(() => this.goTo(this.activeIndex + 1), 3800);
  }

  pause() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

customElements.define('purelane-hero-stage', PurelaneHeroStage);
