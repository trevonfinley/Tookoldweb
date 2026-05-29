// Vercel Speed Insights initialization
// Load and initialize the Speed Insights library
(function() {
  // Create script element to load the Speed Insights library
  var script = document.createElement('script');
  script.src = 'https://va.vercel-scripts.com/v1/speed-insights/script.js';
  script.defer = true;
  
  // Append to head
  if (document.head) {
    document.head.appendChild(script);
  } else {
    // Fallback if head is not available yet
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(script);
    });
  }
})();
