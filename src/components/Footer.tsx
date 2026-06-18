import Emoji from './Emoji'

/** Page footer matching the mock. */
export default function Footer() {
  return (
    <footer className="site-footer">
      <p>© 2026 פסטיבל נוסטלגיה | כל הזכויות שמורות</p>
      <p className="footer-love">
        נבנה בנוסטלגיה <Emoji e="❤️" />
      </p>
    </footer>
  )
}
