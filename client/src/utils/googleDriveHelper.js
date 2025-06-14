/**
 * Extract Google Drive file ID from a sharing URL
 * @param {string} url - Google Drive URL
 * @returns {string|null} - File ID or null if not found
 */
export const extractGoogleDriveFileId = (url) => {
    if (!url || typeof url !== 'string') {
        console.warn('Invalid URL provided to extractGoogleDriveFileId:', url);
        return null;
    }

    try {
        // Format: https://drive.google.com/file/d/FILE_ID/view
        const fileIdRegex = /\/file\/d\/([^/]+)/;
        const match = url.match(fileIdRegex);

        if (match && match[1]) {
            console.log('Extracted file ID from file view URL:', match[1]);
            return match[1];
        }

        // Format: https://drive.google.com/open?id=FILE_ID
        const idParamRegex = /[?&]id=([^&]+)/;
        const paramMatch = url.match(idParamRegex);

        if (paramMatch && paramMatch[1]) {
            console.log('Extracted file ID from open URL:', paramMatch[1]);
            return paramMatch[1];
        }

        console.warn('No file ID found in URL:', url);
        return null;
    } catch (error) {
        console.error('Error extracting Google Drive file ID:', error);
        return null;
    }
};

/**
 * Create a streamable URL for Google Drive videos
 * @param {string} url - Google Drive URL
 * @param {number} urlType - URL format type 
 *   (0: direct download, 1: API, 2: preview, 3: embed, 4: custom proxy)
 * @returns {string|null} - Streamable URL or null if invalid
 */
export const createGoogleDriveStreamUrl = (url, urlType = 0) => {
    try {
        if (!url || typeof url !== 'string') {
            console.error('Invalid Google Drive URL: URL is empty or not a string');
            return null;
        }

        const fileId = extractGoogleDriveFileId(url);

        if (!fileId) {
            console.error('Invalid Google Drive URL format. Please ensure the URL is a valid Google Drive sharing link.');
            return null;
        }

        // Different URL formats for better compatibility with expo-av
        switch (urlType) {
            case 1:
                // Direct stream using the drive API (requires valid API key)
                const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=AIzaSyAy9VVXHGxhEOt7Zq_D3JLUh8oenwadWzQ`;
                console.log('Created Google Drive API URL:', apiUrl);
                return apiUrl;

            case 2:
                // Preview URL format - might work with some video types
                const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                console.log('Created Google Drive preview URL:', previewUrl);
                return previewUrl;

            case 3:
                // Embed URL format - best for iframe but not native player
                const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                console.log('Created Google Drive embed URL:', embedUrl);
                return embedUrl;

            case 4:
                // Export URL with view parameter - often works better for rendering video content
                const exportViewUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                console.log('Created Google Drive export view URL:', exportViewUrl);
                return exportViewUrl;

            case 5:
                // Another format that sometimes works with native players
                const directUrl = `https://www.googleapis.com/drive/v2/files/${fileId}?alt=media`;
                console.log('Created alternative Google Drive direct URL:', directUrl);
                return directUrl;

            case 6:
                // Direct play format - specific to media streaming
                const directPlayUrl = `https://drive.google.com/uc?id=${fileId}`;
                console.log('Created direct play URL:', directPlayUrl);
                return directPlayUrl;

            case 7:
                // Export with both view and download - helps with certain video formats
                const hybridUrl = `https://drive.google.com/uc?export=view&download=1&id=${fileId}`;
                console.log('Created hybrid view/download URL:', hybridUrl);
                return hybridUrl;

            case 0:
            default:
                // Standard export=view URL (changed from download to view for better compatibility)
                const standardUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                console.log('Created standard Google Drive URL:', standardUrl);
                return standardUrl;
        }
    } catch (error) {
        console.error('Error creating Google Drive stream URL:', error);
        return null;
    }
};

/**
 * Validate if a URL is a valid Google Drive URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid Google Drive URL
 */
export const isGoogleDriveUrl = (url) => {
    try {
        if (!url || typeof url !== 'string') {
            console.warn('Invalid URL provided to isGoogleDriveUrl:', url);
            return false;
        }

        // Check if it's a drive.google.com URL
        if (!url.includes('drive.google.com')) {
            console.log('URL is not a Google Drive URL:', url);
            return false;
        }

        // Check if we can extract a file ID
        const hasFileId = extractGoogleDriveFileId(url) !== null;
        console.log('URL validation result:', { url, isGoogleDriveUrl: hasFileId });
        return hasFileId;
    } catch (error) {
        console.error('Error validating Google Drive URL:', error);
        return false;
    }
};

/**
 * Create HTML content for embedding a Google Drive video
 * @param {string} fileId - Google Drive file ID
 * @returns {string} - HTML content for embedding
 */
export const createGoogleDriveHtml = (fileId) => {
    if (!fileId) return '';

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
        </style>
    </head>
    <body>
        <iframe 
            src="https://drive.google.com/file/d/${fileId}/preview" 
            width="100%" 
            height="100%" 
            frameborder="0" 
            allowfullscreen
            allow="autoplay; encrypted-media"
        ></iframe>
    </body>
    </html>
    `;
};

/**
 * Try multiple URL formats to find one that works with expo-av
 * @param {string} originalUrl - Original Google Drive URL
 * @returns {Promise<{url: string, type: number}|null>} - Working URL or null if none work
 */
export const findWorkingGoogleDriveUrl = async (originalUrl) => {
    if (!isGoogleDriveUrl(originalUrl)) {
        return null;
    }

    const fileId = extractGoogleDriveFileId(originalUrl);
    if (!fileId) {
        return null;
    }

    // Try different URL formats in order of likelihood to work with expo-av for video rendering
    // Reordered to prioritize formats that work better for video rendering
    const urlTypes = [7, 4, 6, 0, 1, 5, 2, 3];

    for (const type of urlTypes) {
        try {
            const url = createGoogleDriveStreamUrl(originalUrl, type);
            console.log(`Testing Google Drive URL format type ${type}:`, url);

            // Try a HEAD request to check if the URL is accessible
            try {
                const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
                if (response.ok || response.status === 302) {
                    console.log(`URL format type ${type} appears accessible:`, url);
                    return { url, type };
                }
                console.log(`URL format type ${type} returned status ${response.status}`);
            } catch (error) {
                console.log(`Error checking URL format type ${type}:`, error.message);
                // Continue to the next format even if HEAD request fails
                // Some Google Drive URLs don't allow HEAD requests but still work
                if ([7, 4, 6, 0].includes(type)) {
                    console.log(`Using URL format type ${type} despite HEAD request failure`);
                    return { url, type };
                }
            }
        } catch (error) {
            console.error(`Error creating URL format type ${type}:`, error);
        }
    }

    // If all else fails, return the default format
    const defaultUrl = createGoogleDriveStreamUrl(originalUrl, 7); // Use type 7 as default
    return defaultUrl ? { url: defaultUrl, type: 7 } : null;
}; 