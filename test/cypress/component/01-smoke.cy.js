const sampleAppsHtml = `
<repo-packages>
  <repo-app abbrev="dashboard" type="application" status="installed" path="/exist/apps/dashboard/">
    <repo-title>Dashboard</repo-title>
    <repo-icon><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt=""></repo-icon>
  </repo-app>
  <repo-app abbrev="launcher" type="application" status="installed" path="/exist/apps/launcher/">
    <repo-title>Launcher</repo-title>
  </repo-app>
</repo-packages>
`;

function resolveFetchUrl(input) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  if (input instanceof Request) return input.url;
  return String(input?.url ?? input?.href ?? input);
}

function stubLauncherFetch(win) {
  cy.stub(win, 'fetch').callsFake((input) => {
    const url = resolveFetchUrl(input);
    if (url.includes('packageservice/packages/apps')) {
      return Promise.resolve(
        new win.Response(sampleAppsHtml, {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        })
      );
    }
    if (url.includes('getVersion.xql')) {
      return Promise.resolve(new win.Response('Version 6.0.0', { status: 200 }));
    }
    if (url.includes('/exist/apps/dashboard/login')) {
      return Promise.resolve(
        new win.Response(JSON.stringify({ user: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }
    return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
  });
}

describe('existdb-launcher smoke', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      if (win.fetch?.restore) {
        win.fetch.restore();
      }
      stubLauncherFetch(win);
    });
  });

  it('registers launcher custom elements', () => {
    const components = Cypress.env('components') || [];
    expect(components.length).to.be.greaterThan(0);
    components.forEach(({ tag }) => {
      cy.mount(`<${tag}></${tag}>`);
      cy.get(tag).should('exist');
    });
  });

  it('renders app shell with header', () => {
    cy.mount('<existdb-launcher-app path="/launcher"></existdb-launcher-app>');
    cy.get('existdb-launcher-app').shadow().contains('Launcher');
    cy.get('existdb-launcher-app').shadow().find('existdb-launcher').should('exist');
  });

  it('loads package apps from packageservice', () => {
    cy.mount('<existdb-launcher path="/launcher"></existdb-launcher>');
    cy.get('existdb-launcher').shadow().contains('Dashboard', { timeout: 10000 });
    cy.get('existdb-launcher').shadow().find('existdb-branding').should('exist');
  });

  it('hides ignored abbreviations', () => {
    cy.mount('<existdb-launcher path="/launcher" ignores=\'["launcher"]\'></existdb-launcher>');
    cy.get('existdb-launcher').shadow().contains('Dashboard', { timeout: 10000 });
    cy.get('existdb-launcher')
      .shadow()
      .find('repo-app[abbrev="launcher"]')
      .should('have.class', 'hidden');
  });
});
