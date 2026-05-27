export default function PhoneHeader({ phone }) {
  if (!phone) return null
  return (
    <div className="phone-block">
      {phone.info && (
        <a href={`tel:${phone.info.replace(/[^\d]/g,'')}`} className="phone-pri">
          <span className="phone-label">{phone.info_label || 'Aging Connect'}</span>
          <span className="phone-num">{phone.info}</span>
        </a>
      )}
      {phone.cityInfo && (
        <a href={`tel:${phone.cityInfo}`} className="phone-sec">
          <span className="phone-label">311</span>
        </a>
      )}
      {phone.tty && (
        <a href={`tel:${phone.tty.replace(/[^\d]/g,'')}`} className="phone-sec">
          <span className="phone-label">TTY {phone.tty}</span>
        </a>
      )}
    </div>
  )
}
