/**
 * Component Loader Utility
 * Dynamically loads HTML components into the page
 */

const ComponentLoader = (() => {
  /**
   * Load a single component
   * @param {string} componentPath - Path to the component HTML file
   * @param {string} targetSelector - CSS selector for the target container
   */
  async function loadComponent(componentPath, targetSelector) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`Failed to load ${componentPath}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const target = document.querySelector(targetSelector);
      
      if (!target) {
        console.error(`Target element not found: ${targetSelector}`);
        return;
      }
      
      target.innerHTML = html;
    } catch (error) {
      console.error(`Error loading component ${componentPath}:`, error);
    }
  }

  /**
   * Load multiple components in parallel
   * @param {Array<{path: string, target: string}>} components - Array of component configs
   */
  async function loadComponents(components) {
    const loadPromises = components.map(({ path, target }) => 
      loadComponent(path, target)
    );
    
    await Promise.all(loadPromises);
  }

  /**
   * Initialize all page components
   */
  async function init() {
    const components = [
      { path: 'components/header.html', target: '#header-placeholder' },
      { path: 'components/hero.html', target: '#hero-placeholder' },
      { path: 'components/about.html', target: '#about-placeholder' },
      { path: 'components/experience.html', target: '#experience-placeholder' },
      { path: 'components/projects.html', target: '#projects-placeholder' },
      { path: 'components/contact.html', target: '#contact-placeholder' },
      { path: 'components/chat.html', target: '#chat-placeholder' }
    ];

    await loadComponents(components);
    
    // Dispatch custom event when components are loaded
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
  }

  return {
    init,
    loadComponent,
    loadComponents
  };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ComponentLoader.init());
} else {
  ComponentLoader.init();
}
