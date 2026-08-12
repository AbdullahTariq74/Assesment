/**
 * <purelane-review-rail> — the auto-scrolling review marquee.
 * The prototype paused only on :hover/:focus-within, but its cards had
 * no focusable element inside them, so a keyboard-only visitor had no
 * way to stop the motion (see docs/BUILD-NOTES.md). This adds a real
 * pause/play button wired to the CSS animation via [data-paused].
 */
class PurelaneReviewRail extends HTMLElement {
  connectedCallback() {
    this.toggleButton = this.querySelector('[data-purelane-toggle]');
    if (!this.toggleButton) return;
    this.rail = this.querySelector('.purelane-revrail');
    this.onToggle = this.onToggle.bind(this);
    this.toggleButton.addEventListener('click', this.onToggle);
  }

  disconnectedCallback() {
    if (this.toggleButton) this.toggleButton.removeEventListener('click', this.onToggle);
  }

  onToggle() {
    const paused = this.rail.getAttribute('data-paused') === 'true';
    this.rail.setAttribute('data-paused', String(!paused));
    this.toggleButton.setAttribute('aria-pressed', String(!paused));
    this.toggleButton.querySelector('span').textContent = paused
      ? this.toggleButton.dataset.pauseLabel
      : this.toggleButton.dataset.playLabel;
  }
}

customElements.define('purelane-review-rail', PurelaneReviewRail);
