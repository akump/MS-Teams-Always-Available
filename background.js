try {
    importScripts('src/js/script.js');
    importScripts('src/js/ExtPay.js');
    const extpay = ExtPay('microsoft-teams-always-available');
    extpay.startBackground();
} catch (e) {
    console.error(e);
}