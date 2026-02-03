/**
 * BootSequence.js
 * Handles the macOS-style boot animation sequence
 */

class BootSequence {
  constructor(options = {}) {
    this.duration = options.duration || 3500;
    this.onComplete = options.onComplete || (() => {});
    this.bootScreen = document.getElementById('boot-screen');
    this.desktop = document.getElementById('desktop');
    this.menuBar = document.getElementById('menu-bar');
    this.dock = document.getElementById('dock');
    this.desktopIcons = document.querySelectorAll('.desktop-icon');
  }

  /**
   * Start the boot sequence
   */
  start() {
    // Check for skip preference (e.g., returning visitors)
    if (sessionStorage.getItem('bootComplete')) {
      this.skipToDesktop();
      return;
    }

    // Start boot animation
    setTimeout(() => {
      this.transitionToDesktop();
    }, this.duration);
  }

  /**
   * Transition from boot screen to desktop
   */
  transitionToDesktop() {
    // Fade out boot screen
    this.bootScreen.classList.add('fade-out');

    setTimeout(() => {
      // Hide boot screen completely
      this.bootScreen.classList.add('hidden');

      // Show desktop
      this.desktop.classList.add('visible');

      // Animate menu bar
      setTimeout(() => {
        this.menuBar.classList.add('visible');
      }, 100);

      // Animate dock sliding up
      setTimeout(() => {
        this.dock.classList.add('visible');
      }, 200);

      // Stagger desktop icons
      this.desktopIcons.forEach((icon, index) => {
        setTimeout(() => {
          icon.classList.add('visible');
        }, 300 + (index * 80));
      });

      // Mark boot as complete
      sessionStorage.setItem('bootComplete', 'true');

      // Call completion callback
      setTimeout(() => {
        this.onComplete();
      }, 500 + (this.desktopIcons.length * 80));

    }, 500);
  }

  /**
   * Skip boot sequence (for returning visitors)
   */
  skipToDesktop() {
    this.bootScreen.classList.add('hidden');
    this.desktop.classList.add('visible');
    this.menuBar.classList.add('visible');
    this.dock.classList.add('visible');
    this.desktopIcons.forEach(icon => icon.classList.add('visible'));
    this.onComplete();
  }

  /**
   * Reset boot sequence (for testing)
   */
  reset() {
    sessionStorage.removeItem('bootComplete');
    location.reload();
  }
}

// Export for use in other modules
window.BootSequence = BootSequence;
