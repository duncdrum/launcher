import { LitElement, html, css } from 'lit';

function versionApiUrl() {
  return new URL('modules/getVersion.xql', window.location.href).href;
}

export class ExistdbVersion extends LitElement {
  static properties = {
    versionString: { type: String }
  };

  static styles = css`
    :host {
      display: inline;
    }
  `;

  constructor() {
    super();
    this.versionString = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadVersion();
  }

  async _loadVersion() {
    try {
      const response = await fetch(versionApiUrl(), {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        this.versionString = (await response.text()).trim();
      }
    } catch (err) {
      console.error('getVersion failed:', err);
    }
  }

  render() {
    return html`${this.versionString}`;
  }
}

customElements.define('existdb-version', ExistdbVersion);
