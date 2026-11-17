// "⛶ Full screen" for the 3D views (hidden where the browser can't do it, e.g. iPhone Safari).
import { getLang } from '../i18n.js';
import { esc } from '../util.js';

const L = (en, he) => (getLang() === 'he' ? he : en);
const canFullscreen = () => !!(document.fullscreenEnabled && document.documentElement.requestFullscreen);

export function fullscreenButtonHtml() {
  if (!canFullscreen()) return '';
  const on = !!document.fullscreenElement;
  return `<button class="toggle ${on ? 'on' : ''}" data-fullscreen title="${esc(L('Full screen (Esc to leave)', 'מסך מלא (Esc ליציאה)'))}">⛶ ${esc(on ? L('Exit full screen', 'יציאה ממסך מלא') : L('Full screen', 'מסך מלא'))}</button>`;
}

/** Wire the button inside `root`; `view` is the element shown full screen; `onChange` re-runs the layout. */
export function bindFullscreen(root, view, onChange) {
  root.querySelector('[data-fullscreen]')?.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await view.requestFullscreen();
    } catch { /* the browser refused (e.g. not allowed in an embedded frame) — nothing to do */ }
  });
  if (!view.dataset.fsBound) {
    view.dataset.fsBound = '1';
    document.addEventListener('fullscreenchange', () => {
      const b = root.isConnected ? root.querySelector('[data-fullscreen]') : null;
      if (b) b.outerHTML = fullscreenButtonHtml();
      onChange?.();
    });
  }
}
