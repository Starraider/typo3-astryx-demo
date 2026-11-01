export class ThemeController {
  constructor(root) {
    const userModeAllowed = ['1', 'true'].includes(root.dataset.userMode);
    const modes = ['system', 'light', 'dark'];
    let saved;
    if (userModeAllowed) {
      try { saved = localStorage.getItem('astryx-mode'); } catch { /* Storage can be disabled. */ }
      if (modes.includes(saved)) root.dataset.astryxMode = saved;
    }

    const button = root.querySelector('[data-astryx-mode-toggle]');
    const system = matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => root.dataset.astryxMode === 'dark' || (root.dataset.astryxMode === 'system' && system.matches);
    const renderCodeIcons = () => {
      const dark = isDark();
      root.querySelectorAll('[data-mode-dark-class]').forEach(icon => {
        const classes = icon.dataset.modeDarkClass?.trim().split(/\s+/).filter(Boolean) ?? [];
        icon.classList.remove(...classes);
        if (dark) icon.classList.add(...classes);
      });
    };
    if (!button || !userModeAllowed) {
      renderCodeIcons();
      system.addEventListener('change', renderCodeIcons);
      return;
    }
    const render = () => {
      const dark = isDark();
      const label = dark ? button.dataset.labelLight : button.dataset.labelDark;
      const darkModeClasses = button.dataset.darkModeClass?.trim().split(/\s+/).filter(Boolean) ?? [];
      button.dataset.mode = dark ? 'dark' : 'light';
      button.setAttribute('aria-label', label);
      button.title = label;
      button.querySelector('[data-theme-icon="dark"]').hidden = dark;
      const lightIcon = button.querySelector('[data-theme-icon="light"]');
      lightIcon.hidden = !dark;
      lightIcon.classList.remove(...darkModeClasses);
      if (dark) lightIcon.classList.add(...darkModeClasses);
      renderCodeIcons();
    };
    button.addEventListener('click', () => {
      const mode = isDark() ? 'light' : 'dark';
      root.dataset.astryxMode = mode;
      render();
      try { localStorage.setItem('astryx-mode', mode); } catch { /* The in-page choice still works. */ }
    });
    system.addEventListener('change', render);
    render();
    button.hidden = false;
  }
}
