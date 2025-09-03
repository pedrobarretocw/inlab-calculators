(function() {
  'use strict';
  
  // Avoid double initialization
  if (window.InLabCalculadorasEmbedLoaded) {
    return;
  }
  window.InLabCalculadorasEmbedLoaded = true;
  
  // Get the script element that loaded this file
  const scripts = document.querySelectorAll('script[src*="embed.js"]');
  const currentScript = scripts[scripts.length - 1];
  
  if (!currentScript) {
    console.error('InLab Calculadoras: Could not find embed script element');
    return;
  }
  
  // Extract configuration from data attributes
  const config = {
    mode: currentScript.dataset.mode || 'ab', // 'ab' or 'all'
    article: currentScript.dataset.article || '',
    width: Math.min(parseInt(currentScript.dataset.width) || 500, 500),
    height: Math.min(parseInt(currentScript.dataset.height) || 500, 500),
    theme: currentScript.dataset.theme || 'light'
  };
  
  // Validate configuration
  if (!['ab', 'all'].includes(config.mode)) {
    console.error('InLab Calculadoras: Invalid mode. Use "ab" or "all"');
    return;
  }
  
  // Build iframe URL
  const baseUrl = currentScript.src.replace(/\/embed\.js.*$/, '');
  let iframeUrl = `${baseUrl}/calculadoras/embed/${config.mode}`;
  
  // Add article parameter if provided
  if (config.article) {
    iframeUrl += `?article=${encodeURIComponent(config.article)}`;
  }
  
  // Create iframe element
  const iframe = document.createElement('iframe');
  iframe.src = iframeUrl;
  iframe.width = config.width;
  iframe.height = config.height;
  iframe.frameBorder = '0';
  iframe.scrolling = 'no';
  iframe.loading = 'lazy';
  iframe.title = 'Calculadora Trabalhista InLab';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '8px';
  iframe.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  iframe.style.maxWidth = '100%';
  iframe.style.display = 'block';
  
  // Add responsive behavior
  iframe.style.width = '100%';
  iframe.style.maxWidth = `${config.width}px`;
  iframe.style.height = `${config.height}px`;
  
  // Create container div
  const container = document.createElement('div');
  container.className = 'inlab-calculadoras-embed';
  container.style.margin = '20px 0';
  container.style.textAlign = 'center';
  
  // Add loading state
  const loader = document.createElement('div');
  loader.style.display = 'flex';
  loader.style.alignItems = 'center';
  loader.style.justifyContent = 'center';
  loader.style.height = `${config.height}px`;
  loader.style.backgroundColor = '#f9fafb';
  loader.style.borderRadius = '8px';
  loader.style.border = '1px solid #e5e7eb';
  loader.innerHTML = `
    <div style="text-align: center; color: #6b7280;">
      <div style="width: 32px; height: 32px; border: 2px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px;"></div>
      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px;">Carregando calculadora...</p>
    </div>
  `;
  
  // Add CSS for spinner animation
  if (!document.getElementById('inlab-embed-styles')) {
    const style = document.createElement('style');
    style.id = 'inlab-embed-styles';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  container.appendChild(loader);
  
  // Replace loader with iframe once loaded
  iframe.onload = function() {
    container.removeChild(loader);
    container.appendChild(iframe);
  };
  
  iframe.onerror = function() {
    loader.innerHTML = `
      <div style="text-align: center; color: #dc2626;">
        <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px;">Erro ao carregar calculadora</p>
        <p style="margin: 8px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #6b7280;">Tente recarregar a página</p>
      </div>
    `;
  };
  
  // Insert the container after the current script
  currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
  
  // Message handling for cross-origin communication (future enhancement)
  window.addEventListener('message', function(event) {
    // Verify origin for security
    const allowedOrigins = [baseUrl, window.location.origin];
    if (!allowedOrigins.includes(event.origin)) {
      return;
    }
    
    // Handle resize messages from iframe
    if (event.data && event.data.type === 'resize' && event.data.height) {
      iframe.style.height = `${Math.min(event.data.height, config.height)}px`;
    }
  }, false);
  
  // Log successful initialization
  console.log('InLab Calculadoras embed initialized:', config);
  
})();
