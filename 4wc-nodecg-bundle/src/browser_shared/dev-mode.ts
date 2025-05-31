// This file adds dev mode styling when OSUFR_DEV_MODE is enabled

// Check if we're in dev mode
if (import.meta.env.OSUFR_DEV_MODE) {
  // Create a style element
  const style = document.createElement('style');

  // Set the CSS content
  style.textContent = `
    /* Dev mode styles */
    body {
      background-color: #6a0dad !important;
    }
    
    /* Add a "DEV MODE" indicator in the corner */
    body::after {
      content: 'DEV MODE';
      position: fixed;
      top: 10px;
      right: 10px;
      background-color: red;
      color: white;
      padding: 5px 10px;
      font-family: monospace;
      border-radius: 4px;
      z-index: 9999;
    }
  `;

  // Add it to the document head
  document.head.appendChild(style);

  console.log('🔮 Dev mode enabled - purple background added');
}
