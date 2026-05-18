import { LitElement, html, css } from 'lit';

const LOGIN_URL = '/exist/apps/dashboard/login';

export class ExistdbLogin extends LitElement {
  static properties = {
    loggedIn: { type: Boolean },
    user: { type: String },
    group: { type: String },
    groups: { type: Array },
    auto: { type: Boolean },
    loginLabel: { type: String, attribute: 'login-label' },
    logoutLabel: { type: String, attribute: 'logout-label' },
    loginIcon: { type: String, attribute: 'login-icon' },
    logoutIcon: { type: String, attribute: 'logout-icon' },
    password: { type: String },
    loginUrl: { type: String, attribute: 'login-url' },
    logoutUrl: { type: String, attribute: 'logout-url' },
    _invalid: { state: true },
    _hasFocus: { state: true },
    _dialogOpen: { state: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    a,
    a:link {
      text-decoration: none;
      color: inherit;
    }

    dialog {
      border: none;
      border-radius: 4px;
      padding: 0;
      min-width: 320px;
      max-width: 640px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.4);
    }

    .dialog-header {
      background-color: #2196f3;
      padding: 16px;
      margin: 0;
      color: #f0f0f0;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .dialog-body {
      padding: 16px;
    }

    .field {
      display: block;
      margin-bottom: 12px;
    }

    .field label {
      display: block;
      margin-bottom: 4px;
      font-size: 0.875rem;
    }

    .field input {
      width: 100%;
      box-sizing: border-box;
      padding: 8px;
    }

    @media (max-width: 1024px) {
      .label {
        display: none;
      }
    }

    #message {
      color: #c62828;
    }

    .buttons {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 0 16px 16px;
    }

    .buttons button {
      background: #2196f3;
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
  `;

  constructor() {
    super();
    this.loggedIn = false;
    this.groups = [];
    this.auto = false;
    this.loginIcon = '';
    this.logoutIcon = '';
    this._invalid = false;
    this._hasFocus = true;
    this._dialogOpen = false;
    this._onWindowBlur = () => {
      this._hasFocus = false;
    };
    this._onWindowFocus = () => {
      if (!this._hasFocus) {
        this._hasFocus = true;
        this._checkLogin();
      }
    };
    this._onCheckUser = (ev) => {
      console.log('checkUser event received: %o', ev.detail);
      if (ev.detail?.user === this.user) {
        this.password = ev.detail.password;
        this._confirmLogin();
      }
    };
    this._onDialogClose = () => {
      this._dialogOpen = false;
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('blur', this._onWindowBlur);
    window.addEventListener('focus', this._onWindowFocus);
    document.addEventListener('checkUser', this._onCheckUser);
    this.updateComplete.then(() => this._checkLogin());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('blur', this._onWindowBlur);
    window.removeEventListener('focus', this._onWindowFocus);
    document.removeEventListener('checkUser', this._onCheckUser);
  }

  updated(changed) {
    super.updated(changed);
    if (!changed.has('_dialogOpen')) return;
    const dialog = this.renderRoot?.querySelector('#loginDialog');
    if (!dialog) return;
    if (this._dialogOpen && !dialog.open) {
      dialog.showModal();
    } else if (!this._dialogOpen && dialog.open) {
      dialog.close();
    }
  }

  async _checkLogin(body = null) {
    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body ? new URLSearchParams(body) : undefined
      });
      if (response.ok) {
        await this._handleResponse(await response.json());
      }
    } catch (err) {
      console.error('checkLogin failed:', err);
    }
  }

  _show(ev) {
    ev.preventDefault();
    if (this.loggedIn) {
      this._checkLogin({ logout: this.user });
    } else {
      this._dialogOpen = true;
    }
  }

  _confirmLogin() {
    this._checkLogin({ user: this.user, password: this.password });
  }

  async _handleResponse(resp) {
    const wasLoggedIn = this.loggedIn;
    if (resp?.user && this._checkGroup(resp)) {
      this.loggedIn = true;
      this.user = resp.user;
      this.groups = resp.groups ?? [];
      this._invalid = false;
      if (!wasLoggedIn && this._dialogOpen && this.loginUrl) {
        window.location = this.loginUrl;
      }
      this._dialogOpen = false;
    } else {
      this.loggedIn = false;
      this.password = null;
      if (this._dialogOpen) {
        this._invalid = true;
      } else if (this.auto) {
        this._dialogOpen = true;
      } else if (wasLoggedIn && this.logoutUrl) {
        console.log('redirecting to %s', this.logoutUrl);
        window.location = this.logoutUrl;
      }
    }
  }

  _checkGroup(info) {
    if (this.group) {
      return info.groups && info.groups.indexOf(this.group) > -1;
    }
    return true;
  }

  _onUserInput(e) {
    this.user = e.target.value;
  }

  _onPasswordInput(e) {
    this.password = e.target.value;
  }

  render() {
    return html`
      <a href="#" @click=${this._show} title=${this.user ?? ''}>
        ${this.loggedIn
          ? html`<span class="label">${this.logoutLabel} ${this.user}</span>`
          : html`<span class="label">${this.loginLabel}</span>`}
      </a>

      <dialog id="loginDialog" @close=${this._onDialogClose}>
        <h2 class="dialog-header">Login</h2>
        <div class="dialog-body">
          <form @submit=${(e) => e.preventDefault()}>
            <label class="field">
              User
              <input name="user" .value=${this.user ?? ''} @input=${this._onUserInput} />
            </label>
            <label class="field">
              Password
              <input
                name="password"
                type="password"
                .value=${this.password ?? ''}
                @input=${this._onPasswordInput}
              />
            </label>
          </form>
          ${this._invalid
            ? html`
                <p id="message">
                  Wrong password or invalid user
                  ${this.group ? html`(must be member of group ${this.group})` : null}
                </p>
              `
            : null}
        </div>
        <div class="buttons">
          <button type="button" @click=${this._confirmLogin}>Login</button>
        </div>
      </dialog>
    `;
  }
}

customElements.define('existdb-login', ExistdbLogin);
