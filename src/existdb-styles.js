import { css } from 'lit';

/** Shared launcher shell layout styles (legacy existdb-styles dom-module). */
export const launcherLayoutStyles = css`
  :host {
    display: block;
    font-family: var(--wa-font-sans);
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
  }

  .layout {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background-color: ghostwhite;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }

  .app-header {
    flex: 0 0 60px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgb(0, 136, 204);
    padding: 0 16px;
    color: white;
  }

  .logout {
    color: white;
    font-size: 18px;
    font-weight: 300;
    margin-right: 20px;
  }
`;
