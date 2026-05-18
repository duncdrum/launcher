import { LitElement, html, css } from 'lit';
import '@existdb/repo-elements';
import './launcher-app.js';
import './existdb-branding.js';

function appsUrl(basePath) {
  const base = basePath ?? '..';
  return `${base.replace(/\/$/, '')}/packageservice/packages/apps`;
}

const jsonArrayConverter = {
  fromAttribute(value) {
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
};

function isEmbeddedInDashboard() {
  return document.querySelector('existdb-dashboard') != null;
}

function resolveBasePath(path) {
  if (path == null || path === '') {
    return '..';
  }
  const href = window.location.pathname;
  const idx = href.indexOf(path);
  if (idx === -1) {
    return '..';
  }
  return href.substring(0, idx).replace(/\/$/, '') || '..';
}

export class ExistdbLauncher extends LitElement {
  static properties = {
    ignores: { type: Array, converter: jsonArrayConverter },
    path: { type: String },
    basePath: { type: String, reflect: true, attribute: 'base-path' }
  };

  static styles = css`
    :host {
      display: block;
      position: relative;
      background: ghostwhite;
    }

    [launcher] repo-packages {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
    }

    [launcher] repo-app {
      width: 150px;
      height: 150px;
      position: relative;
      cursor: pointer;
      margin: 10px;
    }

    [launcher] repo-title {
      font-size: 12px;
      display: block;
      position: absolute;
      bottom: 4px;
      left: 0;
      width: 100%;
      text-align: center;
      height: 36px;
      text-shadow: -2px 2px 2px rgba(108, 98, 98, 0.3);
      color: var(--wa-color-neutral-20, #212121);
    }

    [launcher] repo-icon {
      width: 100%;
      height: 100%;
      vertical-align: middle;
      display: table-cell;
      background: transparent;
    }

    [launcher] repo-name,
    [launcher] repo-version,
    [launcher] repo-type,
    [launcher] repo-authors,
    [launcher] repo-abbrev,
    [launcher] repo-description,
    [launcher] repo-website,
    [launcher] repo-url,
    [launcher] repo-license {
      display: none;
    }

    .hidden {
      display: none !important;
    }
  `;

  constructor() {
    super();
    this.ignores = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.basePath = resolveBasePath(this.path);
    this.updateComplete.then(() => {
      this._loadApplications();
      this.focus();
    });
  }

  async _loadApplications() {
    try {
      const response = await fetch(appsUrl(this.basePath), {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to load apps (${response.status})`);
      }
      const apps = this.renderRoot.querySelector('#apps');
      if (!apps) return;
      apps.innerHTML = await response.text();
      this._afterAppsLoaded(apps);
    } catch (err) {
      console.error('_loadApplications failed:', err);
    }
  }

  _afterAppsLoaded(appsEl) {
    if (!isEmbeddedInDashboard()) {
      const branding = document.createElement('existdb-branding');
      const packageRoot = appsEl.querySelector('repo-packages');
      const firstApp = packageRoot?.querySelector('repo-app');
      if (packageRoot && firstApp) {
        packageRoot.insertBefore(branding, firstApp);
      }
    }

    const apps = appsEl.querySelectorAll('repo-app');
    for (const app of apps) {
      const abbrev = app.getAttribute('abbrev');
      if (abbrev && this.ignores?.includes(abbrev)) {
        app.classList.add('hidden');
      }
    }
  }

  render() {
    return html`
      <div id="apps" class="apps" launcher type="launcher">
        <div id="logo"></div>
        <slot id="slot"></slot>
      </div>
    `;
  }
}

customElements.define('existdb-launcher', ExistdbLauncher);
