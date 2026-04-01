// Download button handler
document.addEventListener('DOMContentLoaded', () => {
    const downloadButtons = document.querySelectorAll('#download-btn, #download-cta');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // You can update these URLs to actual App Store and Google Play links
            const isIOS = /iPhone|iPod/.test(navigator.userAgent);
            const appStoreURL = 'https://apps.apple.com/app/fit-femme/id123456789';
            const playStoreURL = 'https://play.google.com/store/apps/details?id=com.fitfemme.app';
            
            if (isIOS) {
                window.location.href = appStoreURL;
            } else {
                window.location.href = playStoreURL;
            }
        });
    });
});
