// Fit Femme — marketing landing
// Sends Download CTAs to the right store based on the visitor's device.
// Android package: com.cerolauto.fitfemmeapp · iOS bundle: com.fitfemme.app · Apple App ID: 6757249898
(function () {
  var APP_STORE_URL = "https://apps.apple.com/nz/app/fit-femme/id6757249898";
  var PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.cerolauto.fitfemmeapp";

  function detectStore() {
    var ua = navigator.userAgent || "";
    var isIOS =
      /iPhone|iPad|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return isIOS ? APP_STORE_URL : PLAY_STORE_URL;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var storeUrl = detectStore();
    // Wire all generic "Download" buttons to the right store.
    var ids = ["download-btn", "download-cta", "mobile-cta-btn"];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.tagName === "A") {
        el.setAttribute("href", storeUrl);
      } else {
        el.addEventListener("click", function () {
          window.location.href = storeUrl;
        });
      }
    });
  });
})();
