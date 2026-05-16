export function MomentLoadingScreen() {
  return (
    <div className="status-screen status-screen--loading">
      <div aria-hidden className="status-hearts">
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className="status-heart"
            style={{
              left: `${(i * 12) % 100}%`,
              fontSize: `${16 + (i % 3) * 3}px`,
              animationDuration: `${10 + i}s`,
              animationDelay: `${i * 0.4}s`,
              opacity: 0.25,
            }}
          >
            ♡
          </span>
        ))}
      </div>
      <div className="status-glow" aria-hidden />
      <main className="status-content">
        <p className="status-code status-code--pulse">♡</p>
        <p className="status-eyebrow">Just a moment</p>
        <h1 className="status-title">
          Unfolding
          <br />
          <em>something special</em>
        </h1>
        <p className="status-body">
          Love takes a breath before it reveals itself. This won&apos;t be long.
        </p>
      </main>
    </div>
  );
}
