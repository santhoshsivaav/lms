/**
 * Secure Video Player Utilities
 * 
 * Helper functions for working with secure video streaming, 
 * particularly for Google Drive embedded videos.
 */

/**
 * Extracts the file ID from a Google Drive URL
 * 
 * @param url Google Drive sharing URL
 * @returns File ID or null if not found
 */
export const extractFileId = (url: string): string | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // Format: https://drive.google.com/file/d/FILE_ID/view
    const fileIdRegex = /\/file\/d\/([^/]+)/;
    const match = url.match(fileIdRegex);

    if (match && match[1]) {
      return match[1];
    }

    // Format: https://drive.google.com/open?id=FILE_ID
    const idParamRegex = /[?&]id=([^&]+)/;
    const paramMatch = url.match(idParamRegex);

    if (paramMatch && paramMatch[1]) {
      return paramMatch[1];
    }

    return null;
  } catch (error) {
    console.error('Error extracting file ID:', error);
    return null;
  }
};

/**
 * Creates a secure preview URL from a Google Drive file ID
 * 
 * @param fileId Google Drive file ID
 * @returns Secure preview URL
 */
export const createPreviewUrl = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

/**
 * Validates if a URL is a Google Drive URL
 * 
 * @param url URL to validate
 * @returns True if valid Google Drive URL
 */
export const isGoogleDriveUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check if it's a drive.google.com URL
  if (!url.includes('drive.google.com')) {
    return false;
  }

  // Ensure we can extract a file ID
  return extractFileId(url) !== null;
};

/**
 * Creates HTML content for embedding a Google Drive video with security measures
 * 
 * @param fileId Google Drive file ID
 * @param userEmail Optional user email to show as watermark
 * @returns HTML content for embedding
 */
export const createSecureEmbedHtml = (fileId: string, userEmail?: string): string => {
  if (!fileId) return '';

  const watermark = userEmail ? `
    <div id="watermark" style="
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 5px 10px;
      background-color: rgba(0,0,0,0.5);
      color: rgba(255,255,255,0.7);
      font-size: 12px;
      font-family: Arial, sans-serif;
      border-radius: 4px;
      pointer-events: none;
      z-index: 9999;
    ">${userEmail}</div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background: #000;
          overflow: hidden;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        /* Disable text selection */
        body {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          overscroll-behavior: none;
        }
      </style>
      <script>
        // Disable right-click
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          return false;
        });
        
        // Block keyboard shortcuts
        document.addEventListener('keydown', function(e) {
          // Prevent save shortcuts: Ctrl+S, Command+S
          if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            return false;
          }
        });
        
        // Block selecting text
        document.addEventListener('selectstart', function(e) {
          e.preventDefault();
          return false;
        });
        
        // Notify container about video events
        function sendMessageToReactNative(message) {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
        
        // Track video load status
        document.addEventListener('DOMContentLoaded', function() {
          sendMessageToReactNative({ type: 'dom_loaded' });
          const iframe = document.querySelector('iframe');
          if (iframe) {
            // Try to detect when iframe has loaded
            iframe.onload = function() {
              sendMessageToReactNative({ type: 'iframe_loaded' });
              setTimeout(function() {
                sendMessageToReactNative({ type: 'content_loaded' });
              }, 3000);
            };
          }
        });
        
        // Add time-based position tracking for the watermark to make it harder to edit out
        function updateWatermarkPosition() {
          const watermark = document.getElementById('watermark');
          if (watermark) {
            const maxX = window.innerWidth - watermark.offsetWidth;
            const maxY = window.innerHeight - watermark.offsetHeight;
            const timestamp = new Date().getTime();
            const period = 30000; // Move position every 30 seconds
            const xPos = Math.floor((timestamp % period) / period * maxX);
            const yPos = Math.floor(((timestamp + 15000) % period) / period * maxY);
            
            watermark.style.left = xPos + 'px';
            watermark.style.top = yPos + 'px';
          }
          setTimeout(updateWatermarkPosition, 10000); // Update every 10 seconds
        }
        
        // Start watermark position updates after load
        window.addEventListener('load', function() {
          if (document.getElementById('watermark')) {
            updateWatermarkPosition();
          }
          
          // Hide download buttons after loading
          setInterval(function() {
            const downloadButtons = document.querySelectorAll('button[aria-label*="download"], a[aria-label*="download"]');
            downloadButtons.forEach(btn => {
              btn.style.display = 'none';
              btn.disabled = true;
            });
            
            const menuItems = document.querySelectorAll('[role="menu"], [role="menuitem"]');
            menuItems.forEach(menu => {
              if (menu.innerText && menu.innerText.toLowerCase().includes('download')) {
                menu.style.display = 'none';
              }
            });

            // Disable video download
            const videoElements = document.querySelectorAll('video');
            videoElements.forEach(video => {
              video.setAttribute('controlsList', 'nodownload');
              video.setAttribute('disablePictureInPicture', 'true');
              video.setAttribute('disableRemotePlayback', 'true');
            });
          }, 2000);
        });
      </script>
    </head>
    <body>
      <iframe 
        src="https://drive.google.com/file/d/${fileId}/preview" 
        width="100%" 
        height="100%" 
        frameborder="0" 
        allowfullscreen
        allow="autoplay; encrypted-media"
        style="pointer-events: auto;"
      ></iframe>
      ${watermark}
    </body>
    </html>
  `;
};

/**
 * Processes a video URL for secure playback
 * 
 * @param url The original video URL
 * @returns Object with processed URL data
 */
export const processVideoUrl = (url: string): {
  isGoogleDrive: boolean;
  fileId: string | null;
  previewUrl: string | null;
  embedHtml: string | null;
} => {
  const isGDrive = isGoogleDriveUrl(url);
  const fileId = isGDrive ? extractFileId(url) : null;
  const previewUrl = fileId ? createPreviewUrl(fileId) : null;
  const embedHtml = fileId ? createSecureEmbedHtml(fileId) : null;

  return {
    isGoogleDrive: isGDrive,
    fileId,
    previewUrl,
    embedHtml
  };
}; 