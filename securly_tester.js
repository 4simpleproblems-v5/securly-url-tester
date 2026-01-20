/**
 * Checks the Securly status for a given URL and Email.
 * * @param {string} email - The student email address
 * @param {string} targetUrl - The website to test
 * @param {string} [proxyPrefix] - Optional: A URL prefix for a CORS proxy (e.g., 'https://cors-anywhere.herokuapp.com/')
 * @returns {Promise<string>} - Returns "BLOCKED", "ALLOWED", "UNKNOWN", or "ERROR"
 */
export async function checkSecurlyStatus(email, targetUrl, proxyPrefix = '') {
    const SECURLY_SERVER = 'https://useast-www.securly.com';

    // 1. Normalize the URL
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
    }

    // 2. Extract Hostname
    let hostname;
    try {
        hostname = new URL(cleanUrl).hostname;
    } catch (e) {
        hostname = cleanUrl;
    }

    // 3. Construct the Securly API URL
    // We use URLSearchParams to safely encode the parameters
    const params = new URLSearchParams({
        useremail: email,
        reason: 'crextn',
        host: hostname,
        url: btoa(cleanUrl), // Base64 encode the target URL
        msg: '',
        ver: '2.97.13',
        cu: SECURLY_SERVER + '/crextn',
        uf: '1',
        cf: '1'
    });

    const directApiUrl = `${SECURLY_SERVER}/crextn/broker?${params.toString()}`;
    
    // Apply proxy if provided
    const finalUrl = proxyPrefix + directApiUrl;

    try {
        const response = await fetch(finalUrl);
        const text = await response.text();

        if (text.includes('DENY')) {
            return 'BLOCKED';
        } else if (text.includes('ALLOW')) {
            return 'ALLOWED';
        } else {
            return 'UNKNOWN';
        }
    } catch (error) {
        console.error("Check failed:", error);
        return 'ERROR';
    }
}
