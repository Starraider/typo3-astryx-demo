export class ThemeController {
  constructor(root) {
    if (!['1', 'true'].includes(root.dataset.userMode)) return;
    const modes = ['system', 'light', 'dark'];
    let saved;
    try { saved = localStorage.getItem('astryx-mode'); } catch { /* Storage can be disabled. */ }
    if (modes.includes(saved)) root.dataset.astryxMode = saved;

    const button = root.querySelector('[data-astryx-mode-toggle]');
    if (!button) return;
    const system = matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => root.dataset.astryxMode === 'dark' || (root.dataset.astryxMode === 'system' && system.matches);
    const render = () => {
      const dark = isDark();
      const label = dark ? button.dataset.labelLight : button.dataset.labelDark;
      button.dataset.mode = dark ? 'dark' : 'light';
      button.setAttribute('aria-label', label);
      button.title = label;
      button.querySelector('[data-theme-icon="dark"]').hidden = dark;
      button.querySelector('[data-theme-icon="light"]').hidden = !dark;
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
