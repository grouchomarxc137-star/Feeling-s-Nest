export default function ConnectionBanner({ connected, otherConnected, otherName }) {
  if (!connected) {
    return <div className="banner banner-warn">Wobbly wifi — gluing the connection back together…</div>;
  }
  if (!otherConnected) {
    return (
      <div className="banner banner-info">
        {otherName} fluttered off somewhere. Everything's saved — they can land right back where you left off.
      </div>
    );
  }
  return null;
}
