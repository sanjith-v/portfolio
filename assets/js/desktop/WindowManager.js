/**
 * WindowManager.js
 * Manages window state, z-index stacking, and window interactions
 */

class WindowManager {
  constructor() {
    this.windows = new Map();
    this.baseZIndex = 1000;
    this.topZIndex = 1000;
    this.activeWindow = null;

    // Bind methods
    this.handleWindowClick = this.handleWindowClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
  }

  /**
   * Initialize window manager
   */
  init() {
    // Register all windows
    document.querySelectorAll('.window').forEach(window => {
      const id = window.id;
      this.windows.set(id, {
        element: window,
        zIndex: this.baseZIndex,
        isOpen: false
      });

      // Add click listener to bring window to front
      window.addEventListener('mousedown', () => this.handleWindowClick(id));

      // Add close button listener
      const closeBtn = window.querySelector('.traffic-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleCloseClick(id);
        });
      }
    });
  }

  /**
   * Open a window
   */
  open(windowId) {
    const windowData = this.windows.get(windowId);
    if (!windowData) return;

    const { element } = windowData;

    // Update dock active state
    this.updateDockActiveState(windowId, true);

    // Bounce dock icon
    this.bounceDockIcon(windowId);

    // If already open, just bring to front
    if (windowData.isOpen) {
      this.bringToFront(windowId);
      return;
    }

    // Open the window
    element.classList.add('open');
    windowData.isOpen = true;

    // Trigger reflow for animation
    element.offsetHeight;

    // Make visible and bring to front
    element.classList.add('visible');
    this.bringToFront(windowId);
  }

  /**
   * Close a window
   */
  close(windowId) {
    const windowData = this.windows.get(windowId);
    if (!windowData || !windowData.isOpen) return;

    const { element } = windowData;

    // Update dock active state
    this.updateDockActiveState(windowId, false);

    // Add closing animation
    element.classList.add('closing');
    element.classList.remove('visible');

    // Wait for animation then hide
    setTimeout(() => {
      element.classList.remove('open', 'closing');
      windowData.isOpen = false;

      // Clear active window if this was it
      if (this.activeWindow === windowId) {
        this.activeWindow = null;
      }
    }, 200);
  }

  /**
   * Toggle a window open/closed
   */
  toggle(windowId) {
    const windowData = this.windows.get(windowId);
    if (!windowData) return;

    if (windowData.isOpen) {
      this.close(windowId);
    } else {
      this.open(windowId);
    }
  }

  /**
   * Bring a window to the front
   */
  bringToFront(windowId) {
    const windowData = this.windows.get(windowId);
    if (!windowData) return;

    // Remove active class from all windows
    this.windows.forEach((data) => {
      data.element.classList.remove('active');
    });

    // Add active class to this window
    windowData.element.classList.add('active');

    this.topZIndex++;
    windowData.zIndex = this.topZIndex;
    windowData.element.style.zIndex = this.topZIndex;
    this.activeWindow = windowId;
  }

  /**
   * Handle window click (bring to front)
   */
  handleWindowClick(windowId) {
    this.bringToFront(windowId);
  }

  /**
   * Handle close button click
   */
  handleCloseClick(windowId) {
    this.close(windowId);
  }

  /**
   * Update dock active indicator
   */
  updateDockActiveState(windowId, isActive) {
    // Map window IDs to dock item data attributes
    const windowToDock = {
      'window-about': 'notes',
      'window-experience': 'calendar',
      'window-projects': 'finder',
      'window-skills': 'terminal',
      'window-certifications': 'keychain',
      'window-contact': 'mail'
    };

    const dockId = windowToDock[windowId];
    if (!dockId) return;

    const dockItem = document.querySelector(`.dock-item[data-window="${windowId}"]`);
    if (dockItem) {
      if (isActive) {
        dockItem.classList.add('active');
      } else {
        dockItem.classList.remove('active');
      }
    }
  }

  /**
   * Bounce dock icon animation
   */
  bounceDockIcon(windowId) {
    const dockItem = document.querySelector(`.dock-item[data-window="${windowId}"]`);
    if (!dockItem) return;

    dockItem.classList.add('bouncing');
    setTimeout(() => {
      dockItem.classList.remove('bouncing');
    }, 500);
  }

  /**
   * Close all windows
   */
  closeAll() {
    this.windows.forEach((data, id) => {
      if (data.isOpen) {
        this.close(id);
      }
    });
  }

  /**
   * Get list of open windows
   */
  getOpenWindows() {
    const openWindows = [];
    this.windows.forEach((data, id) => {
      if (data.isOpen) {
        openWindows.push(id);
      }
    });
    return openWindows;
  }

  /**
   * Check if a window is open
   */
  isOpen(windowId) {
    const windowData = this.windows.get(windowId);
    return windowData ? windowData.isOpen : false;
  }
}

// Export for use in other modules
window.WindowManager = WindowManager;
