/**
 * app.js
 * Main orchestrator for the macOS desktop portfolio
 */

(function() {
  'use strict';

  // Application state
  const App = {
    windowManager: null,
    contentLoader: null,
    bootSequence: null,
    isMobile: false
  };

  /**
   * Check if we're on mobile
   */
  function checkMobile() {
    App.isMobile = window.innerWidth <= 768;
    return App.isMobile;
  }

  /**
   * Initialize the application
   */
  function init() {
    // Check for mobile
    if (checkMobile()) {
      document.body.classList.remove('desktop-mode');
      return;
    }

    // Add desktop mode class
    document.body.classList.add('desktop-mode');

    // Initialize modules
    App.windowManager = new WindowManager();
    App.contentLoader = new ContentLoader();
    App.bootSequence = new BootSequence({
      duration: 3500,
      onComplete: onBootComplete
    });

    // Initialize window manager
    App.windowManager.init();

    // Initialize content loader
    App.contentLoader.init();

    // Setup event listeners
    setupDesktopIcons();
    setupDock();
    setupFinderSidebar();
    setupProjectCards();
    setupKeyboardShortcuts();

    // Update dynamic content
    ContentLoader.updateCalendarIcons();
    ContentLoader.startClock();

    // Start boot sequence
    App.bootSequence.start();
  }

  /**
   * Called when boot sequence completes
   */
  function onBootComplete() {
    console.log('Desktop ready');
  }

  /**
   * Setup desktop icon click handlers
   */
  function setupDesktopIcons() {
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      let clickTimeout = null;

      icon.addEventListener('click', () => {
        // Single click: select
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');

        // Clear double-click timeout
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          // Double-click: open window
          const windowId = icon.dataset.window;
          if (windowId) {
            App.windowManager.open(windowId);
          }
          clickTimeout = null;
        } else {
          clickTimeout = setTimeout(() => {
            clickTimeout = null;
          }, 300);
        }
      });

      // Also support double-click event
      icon.addEventListener('dblclick', () => {
        const windowId = icon.dataset.window;
        if (windowId) {
          App.windowManager.open(windowId);
        }
      });
    });

    // Click on desktop to deselect icons
    document.getElementById('wallpaper')?.addEventListener('click', () => {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    });
  }

  /**
   * Setup dock interactions
   */
  function setupDock() {
    const dock = document.getElementById('dock');
    if (!dock) return;

    const dockItems = dock.querySelectorAll('.dock-item');

    // Magnification effect
    dockItems.forEach((item, index) => {
      item.addEventListener('mouseenter', () => {
        // Add adjacent class to neighbors
        if (dockItems[index - 1]) dockItems[index - 1].classList.add('adjacent');
        if (dockItems[index + 1]) dockItems[index + 1].classList.add('adjacent');
      });

      item.addEventListener('mouseleave', () => {
        // Remove adjacent class from neighbors
        if (dockItems[index - 1]) dockItems[index - 1].classList.remove('adjacent');
        if (dockItems[index + 1]) dockItems[index + 1].classList.remove('adjacent');
      });

      // Click handler
      item.addEventListener('click', () => {
        const windowId = item.dataset.window;
        const externalUrl = item.dataset.url;

        if (windowId) {
          App.windowManager.toggle(windowId);
        } else if (externalUrl) {
          window.open(externalUrl, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }

  /**
   * Setup finder sidebar category filtering
   */
  function setupFinderSidebar() {
    document.querySelectorAll('.finder-sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        const category = item.dataset.category;
        if (category) {
          App.contentLoader.filterProjects(category);
        }
      });
    });
  }

  /**
   * Setup project card click handlers
   */
  function setupProjectCards() {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const projectData = {
          title: card.dataset.title,
          image: card.querySelector('.project-card-image')?.src,
          description: card.dataset.description,
          achievements: card.dataset.achievements ? JSON.parse(card.dataset.achievements) : [],
          projectUrl: card.dataset.projectUrl,
          githubUrl: card.dataset.githubUrl
        };

        App.contentLoader.openProjectModal(projectData);
      });
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // CMD/CTRL + W to close active window
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        if (App.windowManager.activeWindow) {
          App.windowManager.close(App.windowManager.activeWindow);
        }
      }

      // ESC to close active window
      if (e.key === 'Escape') {
        if (App.windowManager.activeWindow) {
          App.windowManager.close(App.windowManager.activeWindow);
        }
      }
    });
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    const wasMobile = App.isMobile;
    checkMobile();

    if (wasMobile !== App.isMobile) {
      location.reload();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle resize
  window.addEventListener('resize', debounce(handleResize, 250));

  /**
   * Debounce helper
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Expose App for debugging
  window.DesktopApp = App;

})();
