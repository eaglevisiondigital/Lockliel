const weeklyLineup = [
  { day: "Monday", theme: "Love", image: "monday-love" },
  { day: "Tuesday", theme: "Righteous", image: "tuesday-righteous" },
  { day: "Wednesday", theme: "Blessed", image: "wednesday-blessed" },
  { day: "Thursday", theme: "Anointed", image: "thursday-anointed" },
  { day: "Friday", theme: "Healed", image: "friday-healed" },
  { day: "Saturday", theme: "Joy-filled", image: "saturday-joy" },
  { day: "Sunday", theme: "Bold", image: "sunday-bold" },
];

export default function FaithBoostSection() {
  return (
    <section className="faith-boost-section" id="faith-boost" aria-labelledby="faith-boost-title">
      <div className="page-shell">
        <div className="faith-boost-feature">
          <div className="faith-boost-copy">
            <p className="faith-boost-eyebrow">Relaunching Faith Boost Broadcast</p>
            <h2 id="faith-boost-title">Your daily<br /><em>shot in the arm.</em></h2>
            <p className="faith-boost-intro">
              A daily reminder of who you are in Christ and what you have in Him.
            </p>
            <div className="faith-boost-declaration">
              <p><strong>You are</strong> who God says you are.</p>
              <p><strong>You have</strong> what He says you have.</p>
              <p><strong>You can do</strong> what He says you can do.</p>
            </div>
            <div className="faith-boost-time" aria-label="Every day at 7 p.m. Central Time">
              <strong>7 <span>PM</span></strong>
              <div><b>Every day</b><span>Central Time</span></div>
            </div>
            <p className="faith-boost-encouragement">
              Tune in for the encouragement you’ve been looking for.
              We’re here to boost your faith and see you win again.
            </p>
            <div className="faith-boost-actions">
              <a className="button button-primary" href="https://www.youtube.com/@Lockliel" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
              <a className="button button-ghost" href="https://www.facebook.com/lockliel" target="_blank" rel="noopener noreferrer">Follow on Facebook</a>
            </div>
          </div>
          <figure className="faith-boost-poster">
            <img src="/faith-boost/daily-lineup.webp" alt="Faith Boost Broadcast relaunching daily at 7 PM CT, with a different identity-in-Christ theme for every day of the week" width="1122" height="1402" loading="lazy" decoding="async" />
            <figcaption>Real truth. Bolder faith. A stronger you.</figcaption>
          </figure>
        </div>

        <div className="faith-boost-lineup-heading">
          <div>
            <p className="faith-boost-eyebrow">The weekly lineup</p>
            <h3>Seven days. One life-changing reminder.</h3>
          </div>
          <p id="faith-boost-scroll-hint">Scroll through all seven days.</p>
        </div>
        <div className="faith-boost-gallery" role="region" aria-label="Faith Boost Broadcast weekly themes" aria-describedby="faith-boost-scroll-hint" tabIndex={0}>
          <ol className="faith-boost-lineup">
            {weeklyLineup.map(({ day, theme, image }) => (
              <li key={day}>
                <figure className="faith-boost-day">
                  <img src={`/faith-boost/${image}.webp`} alt="" width="1672" height="941" loading="lazy" decoding="async" />
                  <figcaption>
                    <div><span>{day}</span><span>7 PM CT</span></div>
                    <h4>{theme} <span>is who you are.</span></h4>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
