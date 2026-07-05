document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const sendBtn = document.getElementById('sendBtn');

  // Helper to validate Pinterest URLs
  function isPinterestUrl(urlStr) {
    try {
      const parsed = new URL(urlStr);
      const host = parsed.hostname.toLowerCase();
      return (
        host.endsWith('pinterest.com') ||
        host.endsWith('pin.it') ||
        host.includes('pinterest.co') ||
        host.includes('pinterest.ca') ||
        host.includes('pinterest.fr') ||
        host.includes('pinterest.de') ||
        host.includes('pinterest.it') ||
        host.includes('pinterest.es')
      );
    } catch (e) {
      return false;
    }
  }

  // Get active browser tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url) {
    statusEl.innerHTML = 'Cannot access page details.';
    return;
  }

  const activeUrl = tab.url;

  if (isPinterestUrl(activeUrl)) {
    statusEl.innerHTML = `Ready to download:<br><strong style="word-break: break-all;">${activeUrl}</strong>`;
    sendBtn.disabled = false;

    sendBtn.addEventListener('click', () => {
      const pinsaverAppUrl = `http://localhost:3000/?url=${encodeURIComponent(activeUrl)}`;
      chrome.tabs.create({ url: pinsaverAppUrl });
    });
  } else {
    statusEl.innerHTML = 'Active page is not a Pinterest page.<br>Go to a Pin video to download.';
    sendBtn.disabled = true;
  }
});
