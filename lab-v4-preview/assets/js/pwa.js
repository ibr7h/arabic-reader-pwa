(() => {
  const installBtn = document.getElementById('pwaInstallBtn');
  let deferredPrompt = null;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service Worker registration failed:', err));
    });
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    if (installBtn) {
      installBtn.hidden = false;
      installBtn.classList.add('flex');
    }
  });

  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
    installBtn.classList.remove('flex');
  });

  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.hidden = true;
  });
})();
