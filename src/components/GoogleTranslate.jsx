import { useEffect } from 'react'

// Renders the mount point for Google Translate. The translate.google.com script
// is loaded in index.html and invokes window.setGoogleTranslateReady() on load.
// If our div mounted after that call already fired, we manually re-invoke here.
export default function GoogleTranslate() {
  useEffect(() => {
    if (typeof window.setGoogleTranslateReady === 'function') {
      window.setGoogleTranslateReady()
    }
  }, [])
  return <div id="google_translate_element" className="google-translate" />
}
