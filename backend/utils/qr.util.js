const generateQRLink = (dustbin_id) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/alerts/scan?dustbin=${dustbin_id}`;
};

const extractDustbinIdFromQR = (qrLink) => {
    try {
        const url = new URL(qrLink);
        return url.searchParams.get('dustbin');
    } catch (e) {
        return null;
    }
};

module.exports = { generateQRLink, extractDustbinIdFromQR };
