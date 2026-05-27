// Boots the Google Translate widget. The translate.google.com script calls
// setGoogleTranslateReady once it loads; the React component also re-invokes
// this on mount in case the script ran before the mount point existed.
function setGoogleTranslateReady() {
  if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) return;
  if (!document.getElementById('google_translate_element')) return;
  if (document.getElementById('google_translate_element').childElementCount > 0) return;
  new window.google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: 'en,es,zh-CN,zh-TW,ru,ko,ht,bn,ar,fr,pl,ur,yi,it',
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
    },
    'google_translate_element'
  );
}
window.setGoogleTranslateReady = setGoogleTranslateReady;
