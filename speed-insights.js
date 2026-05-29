// Vercel Speed Insights initialization
// Using official @vercel/speed-insights package (v2.0.0)
// This initialization follows the official Vercel Speed Insights documentation for vanilla JS projects
(function() {
  // Initialize Speed Insights queue
  if (!window.si) {
    window.si = function() {
      (window.siq = window.siq || []).push(arguments);
    };
  }

  // Check if script is already loaded
  if (document.head.querySelector('script[src*="speed-insights/script"]')) {
    return;
  }

  // Create and configure the Speed Insights script
  const script = document.createElement('script');
  script.src = '/_vercel/speed-insights/script.js';
  script.defer = true;
  
  // Add SDK metadata
  script.dataset.sdkn = '@vercel/speed-insights';
  script.dataset.sdkv = '2.0.0';
  
  // Error handling
  script.onerror = function() {
    console.log('[Vercel Speed Insights] Failed to load script. Please check if any content blockers are enabled and try again.');
  };
  
  // Append to document head
  document.head.appendChild(script);
})();
