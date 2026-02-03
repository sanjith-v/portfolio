/**
 * ContentLoader.js
 * Handles loading and rendering content into windows
 */

class ContentLoader {
  constructor() {
    this.projectModal = null;
    this.currentProject = null;
  }

  /**
   * Initialize content loader
   */
  init() {
    this.projectModal = document.getElementById('project-modal');
    this.setupProjectModal();
  }

  /**
   * Setup project modal interactions
   */
  setupProjectModal() {
    if (!this.projectModal) return;

    // Close modal on background click
    this.projectModal.addEventListener('click', (e) => {
      if (e.target === this.projectModal) {
        this.closeProjectModal();
      }
    });

    // Close button
    const closeBtn = this.projectModal.querySelector('.project-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeProjectModal());
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.projectModal.classList.contains('open')) {
        this.closeProjectModal();
      }
    });
  }

  /**
   * Open project modal with project data
   */
  openProjectModal(projectData) {
    if (!this.projectModal || !projectData) return;

    this.currentProject = projectData;

    // Update modal content
    const title = this.projectModal.querySelector('.project-modal-title');
    const image = this.projectModal.querySelector('.project-modal-image');
    const description = this.projectModal.querySelector('.project-modal-description');
    const achievements = this.projectModal.querySelector('.project-modal-achievements');
    const linksContainer = this.projectModal.querySelector('.project-modal-links');

    if (title) title.textContent = projectData.title;
    if (image) {
      image.src = projectData.image;
      image.alt = projectData.title;
    }
    if (description) description.textContent = projectData.description;

    if (achievements && projectData.achievements) {
      achievements.innerHTML = projectData.achievements.map(a => `<li>${a}</li>`).join('');
    }

    if (linksContainer) {
      linksContainer.innerHTML = '';
      if (projectData.projectUrl) {
        linksContainer.innerHTML += `
          <a href="${projectData.projectUrl}" target="_blank" rel="noopener" class="project-modal-link">
            <span>View Project</span>
            <span>→</span>
          </a>
        `;
      }
      if (projectData.githubUrl) {
        linksContainer.innerHTML += `
          <a href="${projectData.githubUrl}" target="_blank" rel="noopener" class="project-modal-link secondary">
            <span>GitHub</span>
            <span>→</span>
          </a>
        `;
      }
    }

    // Open modal
    this.projectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close project modal
   */
  closeProjectModal() {
    if (!this.projectModal) return;

    this.projectModal.classList.remove('open');
    document.body.style.overflow = '';
    this.currentProject = null;
  }

  /**
   * Filter projects by category
   */
  filterProjects(category) {
    const projectCards = document.querySelectorAll('.project-card');
    const sidebarItems = document.querySelectorAll('.finder-sidebar-item');

    // Update sidebar active state
    sidebarItems.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.category === category) {
        item.classList.add('active');
      }
    });

    // Filter cards
    projectCards.forEach(card => {
      const cardCategories = card.dataset.categories ? card.dataset.categories.split(',') : [];

      if (category === 'all' || cardCategories.includes(category)) {
        card.style.display = '';
        // Animate in
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, 50);
      } else {
        card.style.display = 'none';
      }
    });

    // Update path display
    const pathDisplay = document.querySelector('.finder-path');
    if (pathDisplay) {
      const categoryLabels = {
        'all': 'All Projects',
        'data-science': 'Data Science',
        'ml-ai': 'ML / AI'
      };
      pathDisplay.textContent = `Projects › ${categoryLabels[category] || category}`;
    }
  }

  /**
   * Get current date for calendar icon
   */
  static getCurrentDate() {
    const now = new Date();
    return {
      day: now.getDate(),
      month: now.toLocaleString('default', { month: 'short' }).toUpperCase()
    };
  }

  /**
   * Get current time for menu bar
   */
  static getCurrentTime() {
    const now = new Date();
    return now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Update menu bar time
   */
  static startClock() {
    const timeElement = document.querySelector('.menu-time');
    if (!timeElement) return;

    const updateTime = () => {
      timeElement.textContent = ContentLoader.getCurrentTime();
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  /**
   * Update calendar icons with current date
   */
  static updateCalendarIcons() {
    const { day, month } = ContentLoader.getCurrentDate();

    // Desktop icon calendar
    const desktopCalendarDay = document.querySelector('.icon-calendar-day');
    const desktopCalendarHeader = document.querySelector('.icon-calendar-header');
    if (desktopCalendarDay) desktopCalendarDay.textContent = day;
    if (desktopCalendarHeader) desktopCalendarHeader.textContent = month;

    // Dock calendar
    const dockCalendarDay = document.querySelector('.dock-calendar-day');
    const dockCalendarHeader = document.querySelector('.dock-calendar-header');
    if (dockCalendarDay) dockCalendarDay.textContent = day;
    if (dockCalendarHeader) dockCalendarHeader.textContent = month;
  }
}

// Export for use in other modules
window.ContentLoader = ContentLoader;
