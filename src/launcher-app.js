import { LitElement, html, css } from 'lit';

export class LauncherApp extends LitElement {
  static properties = {
    type: { type: String, reflect: true },
    status: { type: String, reflect: true },
    packageTitle: { type: String, attribute: 'package-title', reflect: true },
    path: { type: String, reflect: true },
    readonly: { type: String, reflect: true }
  };

  static styles = css`
    :host {
      display: table;
      width: 100%;
      height: 100%;
      text-align: center;
      cursor: pointer;
      outline: none;
    }

    :host(:focus-visible) {
      box-shadow:
        0 8px 10px 1px rgba(0, 0, 0, 0.14),
        0 3px 14px 2px rgba(0, 0, 0, 0.12),
        0 5px 5px -3px rgba(0, 0, 0, 0.4);
      background: white;
    }

    ::slotted(repo-icon) {
      width: 100%;
      height: 100%;
      vertical-align: middle;
      display: table-cell;
      background: transparent;
      text-align: center;
    }

    .wrapper {
      width: 100%;
      height: 100%;
      display: table;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
    this.addEventListener('click', this._openApp);
    this.addEventListener('keyup', this._handleEnter);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this._openApp);
    this.removeEventListener('keyup', this._handleEnter);
  }

  _handleEnter(e) {
    const originalTarget = e.composedPath()[0];
    if (originalTarget?.nodeName === 'LAUNCHER-APP' && e.key === 'Enter') {
      this._openApp(e);
    }
  }

  _openApp() {
    const isApp = this.type === 'application';
    if (isApp && this.status === 'installed' && this.path) {
      const targetUrl = this.path;
      setTimeout(() => {
        window.open(targetUrl);
      }, 300);
    }
  }

  render() {
    return html`
      <div class="wrapper">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('launcher-app', LauncherApp);
