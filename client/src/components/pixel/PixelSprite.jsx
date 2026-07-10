// Renders pixel-art frames (arrays of strings, one char per pixel) as crisp SVG.
// With 2+ frames the CSS .frame-N classes alternate to create the animation.
export default function PixelSprite({ frames, palette, px = 4, className = '', style, title }) {
  const rows = frames[0];
  const h = rows.length;
  const w = rows[0].length;
  return (
    <span
      className={`pixel-sprite ${frames.length > 1 ? 'animated' : ''} ${className}`}
      style={{ width: w * px, height: h * px, ...style }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {frames.map((frame, i) => (
        <svg
          key={i}
          className={`frame frame-${i}`}
          width={w * px}
          height={h * px}
          viewBox={`0 0 ${w} ${h}`}
          shapeRendering="crispEdges"
        >
          {frame.flatMap((row, y) =>
            [...row].map((ch, x) =>
              palette[ch] ? <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill={palette[ch]} /> : null
            )
          )}
        </svg>
      ))}
    </span>
  );
}
