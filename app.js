const statusEl = document.getElementById('status');
const userEl = document.getElementById('user');
const tokenEl = document.getElementById('token');

function show(message, details) {
  if (window.__setError) window.__setError(message);
  else statusEl.textContent = message;
  if (userEl) userEl.textContent = details ? String(details) : 'No details';
  if (tokenEl) tokenEl.textContent = 'No token';
  console.error(message, details);
}

console.log('APP JS LOADED');
console.log('typeof Keycloak =', typeof Keycloak);

let keycloak = null;

window.doLogin = function () {
  console.log('Login clicked');
  if (!keycloak) {
    show('Keycloak JS library not loaded', 'window.Keycloak is undefined at click time');
    return;
  }
  keycloak.login();
};

window.doLogout = function () {
  console.log('Logout clicked');
  if (!keycloak) {
    show('Keycloak JS library not loaded', 'window.Keycloak is undefined at logout time');
    return;
  }
  keycloak.logout({
    redirectUri: window.location.origin
  });
};

if (typeof Keycloak === 'undefined') {
  show('Keycloak JS library not loaded', 'window.Keycloak is undefined');
} else {
  keycloak = new Keycloak({
    url: 'https://hgft1uiekbtarpkdjsng-keycloak.services.clever-cloud.com',
    realm: 'demo',
    clientId: 'demo-client'
  });

  function render(authenticated) {
    if (!authenticated) {
      if (window.__setUnauthenticated) { window.__setUnauthenticated(); return; }
      statusEl.textContent = 'Not authenticated';
      if (userEl) userEl.textContent = 'No user authenticated';
      if (tokenEl) tokenEl.textContent = 'No token';
      return;
    }
    if (window.__setAuthenticated) { window.__setAuthenticated(keycloak); return; }
    const parsed = keycloak.tokenParsed || {};
    statusEl.textContent = 'Authenticated';
    if (userEl) userEl.textContent = JSON.stringify({ preferred_username: parsed.preferred_username, email: parsed.email, name: parsed.name, issuer: parsed.iss }, null, 2);
    if (tokenEl) tokenEl.textContent = keycloak.token || 'No token';
  }

  keycloak.init({ onLoad: 'check-sso', pkceMethod: 'S256' })
    .then(function (authenticated) { render(authenticated); })
    .catch(function (err) { show('Keycloak init error', err); });
}
