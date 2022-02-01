try {
    importScripts('src/js/ExtPay.js');
    importScripts('src/js/script.js');
    const extpay = ExtPay('microsoft-teams-always-available');
    extpay.startBackground();

} catch (e) {
    console.error(e);
}