import { LitElement, html, css } from 'lit';
import { launcherLayoutStyles } from './existdb-styles.js';
import './existdb-launcher.js';

const jsonArrayConverter = {
  fromAttribute(value) {
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  },
  toAttribute(value) {
    return JSON.stringify(value ?? []);
  }
};

export class ExistdbLauncherApp extends LitElement {
  static properties = {
    ignores: { type: Array, converter: jsonArrayConverter },
    path: { type: String, reflect: true }
  };

  static styles = [
    launcherLayoutStyles,
    css`
      :host {
        background: ghostwhite;
        --existdb-login-link-color: black;
      }

      .app-header {
        background: var(--wa-color-brand-50, #2196f3);
      }

      .header-icon {
        width: 36px;
        height: 36px;
        margin-right: 10px;
      }

      .title {
        flex: 1;
        font-size: 20px;
        font-weight: 400;
      }

      .main {
        flex: 1;
        overflow: auto;
      }

      @media only screen and (max-width: 768px) {
        .title {
          font-size: 18px;
        }

        .header-icon--hide-mobile {
          display: none;
        }

        .app-header {
          padding-right: 0;
        }
      }
    `
  ];

  render() {
    const iconSrc = 'resources/icon.svg';
    return html`
      <div class="layout">
        <header class="app-header">
          <img
            class="header-icon header-icon--hide-mobile"
            src=${iconSrc}
            alt=""
            width="36"
            height="36"
          />
          <slot name="toggleIcon"></slot>
          <div class="title">Launcher</div>
          <slot></slot>
        </header>
        <main class="main">
          <existdb-launcher
            path=${this.path ?? ''}
            .ignores=${this.ignores ?? []}
          ></existdb-launcher>
        </main>
      </div>
    `;
  }
}

customElements.define('existdb-launcher-app', ExistdbLauncherApp);
