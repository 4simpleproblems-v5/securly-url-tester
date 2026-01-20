/**
 * PROXY CONFIGURATION
 * To remove the proxy, simply make this function return the 'url' directly:
 * const applyProxy = (url) => url;
 */
const applyProxy = (targetUrl) => {
    // Current: uses corsproxy.io
    return 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
};

/**
 * Main Check Function
 * @param {string} email - Student email
 * @param {string} urlToCheck - The URL to test
 */
export async function checkSecurly(email, urlToCheck) {
    const SECURLY_SERVER = 'https://useast-www.securly.com';

    // 1. Normalize URL
    let cleanUrl = urlToCheck.trim();
    if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
    }

    // 2. Get Hostname safely
    let hostname;
    try {
        hostname = new URL(cleanUrl).hostname;
    } catch (e) {
        hostname = cleanUrl;
    }

    // 3. Build Securly API Parameters
    const params = new URLSearchParams({
        useremail: email,
        reason: 'crextn',
        host: hostname,
        url: btoa(cleanUrl), // URL must be Base64 encoded
        msg: '',
        ver: '2.97.13',
        cu: SECURLY_SERVER + '/crextn',
        uf: '1',
        cf: '1'
    });

    const directApiUrl = `${SECURLY_SERVER}/crextn/broker?${params.toString()}`;
    
    // 4. Wrap with Proxy
    const finalUrl = applyProxy(directApiUrl);

    try {
        const response = await fetch(finalUrl);
        const text = await response.text();

        if (text.includes('DENY')) return 'BLOCKED';
        if (text.includes('ALLOW')) return 'ALLOWED';
        return 'UNKNOWN';
        
    } catch (error) {
        console.error("Fetch error:", error);
        return 'ERROR';
    }
}
