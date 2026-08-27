const visionSteps = [
  {
    number: "01",
    title: "Reach",
    tagline: "Turn everyday believers into confident Gospel carriers.",
    copy: "Put clear, shareable Gospel content and practical evangelism tools right where real conversations happen.",
    image: "/marketplace-witnessing.png",
  },
  {
    number: "02",
    title: "Teach",
    tagline: "Put truth in people’s hands at the moment they need it.",
    copy: "Meet real questions with biblical answers, encouragement, and truth people can understand and live.",
    image: "/faith-training-workshop.png",
  },
  {
    number: "03",
    title: "Train",
    tagline: "Move the Church from inspired spectators to equipped laborers.",
    copy: "Build confident believers who know how to share, serve, lead, and become active in the harvest.",
    image: "/compassion-outreach.png",
  },
  {
    number: "04",
    title: "Disciple",
    tagline: "Help every new believer become rooted—and multiplying.",
    copy: "Create engaging follow-up pathways that build faith, connection, spiritual strength, and lasting momentum.",
    image: "/home-small-group.png",
  },
];

const videos = [
  {
    eyebrow: "Start here",
    title: "What Is Lockliel?",
    description: "Dave Fowler shares the heart, assignment, and global vision behind Lockliel.",
    videoId: "Wp6MqjuOJjQ",
    thumbnail: "/lockliel-short-vision-thumbnail.png",
    thumbnailType: "stats",
  },
  {
    eyebrow: "15-minute raw vision",
    title: "What Is Lockliel? — The Long-Form Vision",
    description: "For those who want to take the time to truly hear the heart of Lockliel—what it is, what it will become, and the global assignment behind it.",
    videoId: "d-T_sTTySxc",
    thumbnail: "/lockliel-long-form-vision-thumbnail.png",
  },
  {
    eyebrow: "Why partnership matters",
    title: "Counting the Cost of Taking the Gospel to the World",
    description: "A candid look at the cost—and the eternal value—of building a tool to reach people worldwide.",
    videoId: "0dAYlwQ_-fU",
    thumbnail: "/lockliel-counting-cost-thumbnail.png",
    thumbnailType: "cost",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Lockliel home">
          <img src="/lockliel-mark.png" alt="" />
          <span>Lockliel</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#vision">The Vision</a>
          <a href="#videos">Videos</a>
          <a href="#partner">Partnership</a>
        </nav>
        <a className="header-cta" href="#partner">Sow Into the Vision</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-overlay" />
        <div className="hero-content page-shell">
          <p className="kicker"><span /> A global Christian technology platform</p>
          <h1>Equip the Church.<br /><em>Reach the world.</em></h1>
          <p className="hero-copy">
            Lockliel is being built to put evangelism, follow-up, discipleship,
            and connection tools into the hands of believers—mobilizing the
            Church for the harvest like never before.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#videos">
              <span className="play-icon">▶</span> Watch the Vision
            </a>
            <a className="button button-ghost" href="#partner">Help Build It</a>
          </div>
          <div className="hero-rail" aria-label="Lockliel mission framework">
            {["Reach", "Teach", "Train", "Disciple"].map((step, index) => (
              <div key={step}>
                <span>0{index + 1}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="challenge-section">
        <div className="page-shell challenge-grid">
          <div className="challenge-intro">
            <p className="section-kicker">The challenge we are confronting</p>
            <h2>The Church doesn’t lack passion. It needs a clear path from belief to bold action.</h2>
          </div>
          <div className="stat-card share-stat">
            <img src="/conversation-outside-store.png" alt="Two women having a warm conversation outside a neighborhood store" />
            <div className="stat-image-shade" />
            <div className="stat-topline"><span>The conversation gap</span><b>01</b></div>
            <div className="stat-content">
              <strong>80<span>%</span></strong>
              <p>of Christians have never shared their faith with anyone in their lifetime.</p>
              <em>That means 4 out of 5 believers are still waiting for a simple way to begin.</em>
            </div>
          </div>
          <div className="stat-card accent-stat lead-stat">
            <img src="/prayer-leading-someone.png" alt="Two everyday people standing together with heads bowed in prayer" />
            <div className="stat-image-shade" />
            <div className="stat-topline"><span>The multiplication opportunity</span><b>02</b></div>
            <div className="stat-content">
              <span className="stat-only">Only</span>
              <strong>3 - 5<span>%</span></strong>
              <p>of Christians in the history of the world have ever led one person to Christ.</p>
              <em>Imagine what changes when the whole Church is equipped to reach one.</em>
            </div>
          </div>
        </div>
        <div className="page-shell change-line">
          <span>Lockliel is being built to change both.</span>
          <span className="line" />
        </div>
      </section>

      <section className="harvest-numbers-section" aria-labelledby="harvest-numbers-title">
        <div className="harvest-numbers-glow" aria-hidden="true" />
        <div className="page-shell harvest-numbers-layout">
          <div className="harvest-numbers-copy">
            <p className="section-kicker light">The harvest before us</p>
            <h2 id="harvest-numbers-title">More than <em>8.3 billion</em> people.<br />One global mission.</h2>
            <p>
              Approximately 2.5 billion people worldwide identify as Christian.
              Roughly 5.8 billion do not. The need is enormous—and so is the
              opportunity before the Church.
            </p>
            <div className="world-counts" aria-label="Estimated worldwide religious identity">
              <div>
                <span>Identify as Christian</span>
                <strong>≈2.5B</strong>
                <small>about thirty percent</small>
              </div>
              <div>
                <span>The harvest still before us</span>
                <strong>≈5.8B</strong>
                <small>more than two-thirds of the world</small>
              </div>
            </div>
          </div>

          <div className="global-ratio" aria-label="About three out of every ten people worldwide identify as Christian">
            <span className="ratio-orbit orbit-one" aria-hidden="true" />
            <span className="ratio-orbit orbit-two" aria-hidden="true" />
            <small>Only about</small>
            <strong><b>3</b><span>out of</span><b>10</b></strong>
            <p>people worldwide identify as Christian</p>
          </div>

          <div className="reach-one-callout">
            <div>
              <span>The multiplication question</span>
              <h3>What if every Christian reached one?</h3>
              <p>One believer. One conversation. One life changed. Multiplied around the world.</p>
            </div>
            <strong aria-hidden="true">×1</strong>
          </div>

          <div className="harvest-numbers-note">
            <p>
              Religious identity is not necessarily the same as personally
              knowing and following Christ. The true spiritual need is greater
              than numbers alone can show.
            </p>
            <small>
              Rounded estimates. Population data: <a href="https://population.un.org/wpp/" target="_blank" rel="noreferrer">United Nations</a>.
              Christian affiliation benchmark: <a href="https://www.pewresearch.org/religion/2025/06/09/how-the-global-religious-landscape-changed-from-2010-to-2020/" target="_blank" rel="noreferrer">Pew Research Center</a>.
            </small>
          </div>
        </div>
      </section>

      <section className="everywhere-section" aria-labelledby="everywhere-title">
        <div className="page-shell everywhere-heading">
          <p className="section-kicker">The Gospel belongs everywhere</p>
          <h2 id="everywhere-title">One believer. One conversation.<br /><em>One life changed.</em></h2>
          <p>
            Lockliel is being designed for the moments where ministry actually
            happens—in homes, neighborhoods, workplaces, marketplaces, and
            small groups all over the world.
          </p>
        </div>
        <div className="page-shell ministry-scenes">
          <article className="scene-card marketplace-scene">
            <img src="/park-gospel-conversation.png" alt="Two women sharing a meaningful Gospel conversation beside a neighborhood market" />
            <div className="scene-overlay" />
            <div className="scene-copy">
              <span>01 · One-on-one</span>
              <h3>Share the Gospel naturally.</h3>
              <p>Help believers begin meaningful conversations wherever life happens.</p>
            </div>
          </article>
          <article className="scene-card home-scene">
            <img src="/living-room-small-group-v2.png" alt="A diverse small group studying the Bible together in a warm living room" />
            <div className="scene-overlay" />
            <div className="scene-copy">
              <span>02 · In homes and small groups</span>
              <h3>Turn connection into discipleship.</h3>
              <p>Give local groups content and pathways that help people grow together.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="on-the-go-section" aria-labelledby="on-the-go-title">
        <div className="on-the-go-orbit" aria-hidden="true" />
        <div className="page-shell">
          <div className="on-the-go-heading">
            <div>
              <p className="section-kicker light">Faith in action · right from your phone</p>
              <h2 id="on-the-go-title">Equipping. Empowering.<br /><em>Mobilizing.</em></h2>
            </div>
            <div className="on-the-go-intro">
              <strong>The Church—like never before.</strong>
              <p>
                Lockliel is being built to place powerful, biblically grounded
                tools directly into the hands of everyday believers—making it
                simpler to share hope, meet real needs, and begin Gospel conversations.
              </p>
            </div>
          </div>

          <div className="action-cards">
            <article className="action-card action-equip">
              <img src="/lockliel-truth-for-the-moment.png" alt="A woman receiving timely hope through a video on her phone during a difficult moment" />
              <div className="action-shade" />
              <div className="action-number">01</div>
              <div className="action-copy">
                <span>Equip</span>
                <h3>Truth for the moment.</h3>
                <p>Find bite-sized biblical videos and resources for the fear, pain, question, or need someone is facing right now.</p>
              </div>
            </article>

            <article className="action-card action-empower">
              <img src="/lockliel-share-from-anywhere.png" alt="Two friends sharing a meaningful video from a phone in an everyday setting" />
              <div className="action-shade" />
              <div className="phone-share-badge" aria-hidden="true">
                <span>Share hope</span>
                <strong>in seconds</strong>
                <i>↗</i>
              </div>
              <div className="action-number">02</div>
              <div className="action-copy">
                <span>Empower</span>
                <h3>Share from anywhere.</h3>
                <p>Send the right message from your phone—in a home, workplace, neighborhood, or wherever God opens a door.</p>
              </div>
            </article>

            <article className="action-card action-mobilize">
              <img src="/lockliel-supported-conversation.png" alt="A believer supported by trusted people while continuing a meaningful conversation by phone" />
              <div className="action-shade" />
              <div className="action-number">03</div>
              <div className="action-copy">
                <span>Mobilize</span>
                <h3>Keep the conversation going.</h3>
                <p>Turn a shared resource into prayer, honest questions, a Gospel conversation, follow-up, and discipleship.</p>
              </div>
            </article>

            <article className="action-card action-mission">
              <div className="mission-rings" aria-hidden="true"><span /><span /><span /></div>
              <div className="action-number">04</div>
              <div className="mission-label">Our mission</div>
              <div className="mission-steps" aria-label="Reach, teach, train, disciple">
                <span><b>01</b><strong>Reach</strong></span>
                <span><b>02</b><strong>Teach</strong></span>
                <span><b>03</b><strong>Train</strong></span>
                <span><b>04</b><strong>Disciple</strong></span>
              </div>
              <div className="mission-multiplier" aria-hidden="true">
                <span className="multiplier-line line-one" />
                <span className="multiplier-line line-two" />
                <span className="multiplier-line line-three" />
                <span className="multiplier-line line-four" />
                <span className="multiplier-person person-one" />
                <span className="multiplier-person person-two" />
                <span className="multiplier-person person-three" />
                <span className="multiplier-person person-four" />
                <div><small>One equipped believer</small><strong>×</strong><b>Multiplication</b></div>
              </div>
              <div className="action-copy">
                <span>The outcome</span>
                <h3>Mobilized believers who multiply.</h3>
                <p>Equipping the Church to reach people, teach truth, train believers, and make disciples who reach others.</p>
              </div>
            </article>
          </div>

          <div className="never-alone-panel">
            <div className="never-alone-mark" aria-hidden="true">
              <span>+</span><span>+</span><span>+</span>
            </div>
            <div>
              <p className="section-kicker light">A worldwide family standing with you</p>
              <h3>You’re not expected to do this alone.</h3>
              <p>
                When a conversation reaches a question you do not know how to
                answer, trusted believers and ministry leaders within the
                Lockliel network can help you pray, find biblical guidance, and
                take the next step together.
              </p>
            </div>
            <blockquote>
              You may not know every answer.<br />
              <strong>You can still help someone find the Answer.</strong>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="vision-section" id="vision">
        <div className="page-shell">
          <div className="section-heading two-column-heading">
            <div>
              <p className="section-kicker">A multiplying mission</p>
              <h2>One platform.<br />Four movements.</h2>
            </div>
            <p>
              Lockliel is more than a media library or ministry website. It is
              envisioned as a worldwide ecosystem that helps believers move
              from consuming content to actively reaching and discipling people.
            </p>
          </div>
          <div className="steps-grid">
            {visionSteps.map((step) => (
              <article className="step-card" key={step.title}>
                <img src={step.image} alt="" />
                <div className="step-shade" />
                <div className="step-topline"><span>{step.number}</span><b>Lockliel movement</b></div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <strong>{step.tagline}</strong>
                  <p>{step.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="connection-section">
        <div className="page-shell connection-grid">
          <div className="connection-copy">
            <p className="section-kicker light">Built for local impact and global reach</p>
            <h2>Connect believers.<br />Strengthen disciples.<br /><em>Multiply the Gospel.</em></h2>
            <p>
              From short shareable videos and interactive follow-up to small
              groups, live events, testimonies, and worldwide connection,
              Lockliel is designed to meet people where they are and help them
              become who God has called them to be.
            </p>
          </div>
          <div className="harvest-visual">
            <img src="/global-harvest-v2.png" alt="A vast diverse crowd of ordinary people gathered toward a radiant sunrise, representing the global harvest" />
            <div className="harvest-image-shade" />
            <div className="billion-badge">
              <strong>1B</strong>
              <span>One billion souls</span>
            </div>
            <blockquote>
              <span>“</span>
              The harvest is truly plentiful, but the laborers are few.
              <cite>Matthew 9:37</cite>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="videos-section" id="videos">
        <div className="page-shell">
          <div className="section-heading centered-heading">
            <p className="section-kicker">Hear the heart behind Lockliel</p>
            <h2>Watch the vision unfold.</h2>
            <p>
              These messages explain what Lockliel is, why it matters now, and
              how you can help bring the vision to life.
            </p>
          </div>
          <div className="videos-grid">
            {videos.map((video, index) => (
              <article className={`video-card ${index === 0 ? "featured-video" : ""}`} key={video.videoId}>
                <div className="video-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                    srcDoc={video.thumbnail ? `
                      <style>
                        *{box-sizing:border-box}body{margin:0;background:#031224;font-family:Arial,sans-serif}
                        a{position:absolute;inset:0;display:flex;align-items:center;color:white;text-decoration:none;overflow:hidden}
                        img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
                        .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(1,8,19,.94) 0%,rgba(1,10,24,.72) 42%,rgba(2,16,34,.04) 75%)}
                        .copy{position:relative;z-index:2;width:58%;padding:8%}
                        .eyebrow{display:block;margin-bottom:4%;color:#55b8ff;font-size:clamp(9px,1.25vw,16px);font-weight:800;letter-spacing:.2em;text-transform:uppercase}
                        h2{margin:0;font-size:clamp(25px,4.4vw,62px);line-height:.92;letter-spacing:-.055em;text-transform:uppercase}
                        h2 em{display:block;margin-top:2%;color:#55b8ff;font-size:.48em;font-style:normal;letter-spacing:.08em}
                        .play{display:flex;align-items:center;gap:12px;margin-top:8%;font-size:clamp(10px,1.2vw,15px);font-weight:800;letter-spacing:.08em;text-transform:uppercase}
                        .play b{display:grid;place-items:center;width:clamp(42px,5vw,68px);height:clamp(42px,5vw,68px);border:1px solid rgba(255,255,255,.7);border-radius:50%;background:#0b84e3;box-shadow:0 0 35px rgba(11,132,227,.55);font-size:1.1em;padding-left:4px}
                        .stats{display:grid;grid-template-columns:1fr 1fr;gap:clamp(10px,2vw,24px);width:min(680px,92vw)}
                        .stat{display:block;padding:clamp(10px,1.8vw,22px);border:1px solid rgba(102,188,250,.55);border-radius:clamp(10px,1.4vw,20px);background:rgba(2,15,30,.68);backdrop-filter:blur(8px)}
                        .stat strong{display:block;color:#55b8ff;font-size:clamp(27px,4.8vw,68px);line-height:.8;letter-spacing:-.06em}
                        .stat small{display:block;margin-top:10px;color:white;font-size:clamp(8px,1.05vw,13px);line-height:1.25;font-weight:800;text-transform:uppercase;letter-spacing:.04em}
                        .stat .only{margin:0 0 7px;color:#8bd2ff;font-size:clamp(7px,.9vw,11px);letter-spacing:.18em}
                        .discover{display:block;max-width:660px;margin-top:clamp(10px,2vw,24px);font-size:clamp(9px,1.25vw,16px);line-height:1.35;font-weight:700}
                        .cost-title{font-size:clamp(22px,3.5vw,50px)}
                        .cost-title em{font-size:.46em;line-height:1.2;letter-spacing:.04em}
                      </style>
                      <a href="https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1" aria-label="Play ${video.title}">
                        <img src="${video.thumbnail}" alt="" />
                        <span class="shade"></span>
                        <span class="copy">
                          ${video.thumbnailType === "stats" ? `
                            <span class="eyebrow">The challenge we’re changing</span>
                            <span class="stats">
                              <span class="stat"><strong>80%</strong><small>have never shared their faith</small></span>
                              <span class="stat"><small class="only">Only</small><strong>3 - 5%</strong><small>have led one person to Christ</small></span>
                            </span>
                            <span class="discover">Discover what Lockliel is—and how we’re going to change that.</span>
                            <span class="play"><b>▶</b> Watch the short vision</span>
                          ` : video.thumbnailType === "cost" ? `
                            <span class="eyebrow">Why partnership matters</span>
                            <h2 class="cost-title">Counting the Cost<em>of taking the Gospel to the world</em></h2>
                            <span class="discover">Every soul is worth it. Every seed helps build the way.</span>
                            <span class="play"><b>▶</b> Watch the message</span>
                          ` : `
                            <span class="eyebrow">15-minute raw vision</span>
                            <h2>What Is Lockliel?<em>The long-form vision</em></h2>
                            <span class="play"><b>▶</b> Play the full message</span>
                          `}
                        </span>
                      </a>` : undefined}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="video-details">
                  <p>{video.eyebrow}</p>
                  <h3>{video.title}</h3>
                  <span>{video.description}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relaunch-section">
        <div className="relaunch-backdrop" />
        <div className="page-shell relaunch-grid">
          <div className="relaunch-marker">
            <span>New season</span>
            <strong>We’re<br />all in.</strong>
            <b>→</b>
          </div>
          <div className="relaunch-copy">
            <p className="section-kicker light">The vision is moving forward</p>
            <h2>Doubling down on the <em>technology.</em><br />Turning up the <em>message.</em></h2>
            <p>
              Development is moving forward with renewed focus. We will also be
              starting back with the <strong>Monday through Friday Faith Boost
              Broadcast</strong>, bringing fresh encouragement while the
              Lockliel platform is being built.
            </p>
            <div className="broadcast-chip"><span>5×</span><strong>Faith Boost</strong><small>Monday–Friday</small></div>
          </div>
          <div className="launch-date">
            <span>Next milestone</span>
            <strong>Mid-September</strong>
            <small>Secure one-time and recurring giving opportunities go live again.</small>
            <i>Help us build faster ↗</i>
          </div>
        </div>
      </section>

      <section className="partner-section" id="partner">
        <div className="partner-glow" />
        <div className="page-shell partner-layout">
          <div className="partner-copy">
            <p className="section-kicker light">Your partnership matters</p>
            <h2>Help build what will reach millions.</h2>
            <p>
              Every gift helps accelerate the technology, security, multimedia
              content, beta testing, and launch work required to place this
              global Gospel tool into believers’ hands.
            </p>
            <div className="partner-note">
              <strong>No pressure. No compulsion.</strong>
              <span>Pray, ask the Lord, and sow what He places on your heart.</span>
            </div>
          </div>
          <div className="giving-panel">
            <p className="giving-label">Sow into the vision</p>
            <div className="open-gift">
              <span>Give as the Lord leads</span>
              <strong>Any amount</strong>
              <p>Every seed helps us build faster, create more content, and move closer to launch.</p>
            </div>
            <div className="giving-status">
              <span className="status-dot" />
              <p><strong>Secure giving links return mid-September.</strong><br />One-time and recurring giving will both be available.</p>
            </div>
            <form
              className="notify-form"
              name="lockliel-interest"
              action="/thank-you"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
            >
              <input type="hidden" name="form-name" value="lockliel-interest" />
              <p className="form-honeypot" aria-hidden="true">
                <label>Do not fill this out <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
              </p>
              <div className="form-heading">
                <strong>Be the first to know</strong>
                <span>We’ll send you the giving link when it goes live.</span>
              </div>
              <label className="full-field">
                <span>Name</span>
                <input type="text" name="name" placeholder="Your full name" autoComplete="name" required />
              </label>
              <label className="full-field">
                <span>Email address</span>
                <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
              </label>
              <label>
                <span>City</span>
                <input type="text" name="city" placeholder="Your city" autoComplete="address-level2" required />
              </label>
              <label>
                <span>State</span>
                <input type="text" name="state" placeholder="State / province" autoComplete="address-level1" required />
              </label>
              <label className="full-field">
                <span>Country</span>
                <input type="text" name="country" placeholder="Your country" autoComplete="country-name" required />
              </label>
              <fieldset className="harvest-pledge full-field">
                <legend>Partner in the Harvest <span>Optional</span></legend>
                <p>If you already have an amount in your heart, you can share your intended partnership with us.</p>
                <div className="pledge-controls">
                  <label className="pledge-amount">
                    <span>Pledge amount</span>
                    <div><b>$</b><input type="number" name="pledge-amount" min="1" step="1" placeholder="Amount" /></div>
                  </label>
                  <div className="pledge-frequency" role="group" aria-label="Optional pledge frequency">
                    <span>Partnership</span>
                    <label><input type="radio" name="pledge-frequency" value="One time" /> <b>One time</b></label>
                    <label><input type="radio" name="pledge-frequency" value="Monthly" /> <b>Monthly</b></label>
                  </div>
                </div>
              </fieldset>
              <button className="button button-primary giving-button full-field" type="submit">
                Notify Me When Giving Opens <span>↗</span>
              </button>
            </form>
            <p className="giving-footnote">No phone number required. We’ll only use this information for Lockliel updates.</p>
          </div>
        </div>
      </section>

      <section className="social-section" aria-labelledby="social-heading">
        <div className="social-glow" />
        <div className="page-shell social-layout">
          <div className="social-copy">
            <p className="section-kicker light">The vision is moving</p>
            <h2 id="social-heading">Stay connected<br /><em>with us.</em></h2>
            <p>Follow Lockliel on any—or all—of our social channels and stay close to every update, message, and milestone.</p>
          </div>
          <nav className="social-icons" aria-label="Follow Lockliel on social media">
            <a href="https://www.facebook.com/lockliel" target="_blank" rel="noreferrer" aria-label="Follow Lockliel on Facebook" title="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8.5V6.8c0-.8.5-1 1-1h2.5V2.1L14.1 2C10.7 2 9 4 9 6.4v2.1H6V13h3v9h5v-9h3.3l.6-4.5H14Z" /></svg>
            </a>
            <a href="https://twitter.com/lockliel" target="_blank" rel="noreferrer" aria-label="Follow Lockliel on X" title="X">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.7 2H22l-7.2 8.2L23.3 22h-6.7l-5.2-6.8L5.4 22H2l7.8-8.9L1.7 2h6.9l4.7 6.2L18.7 2Zm-1.2 17.9h1.8L7.6 4H5.7l11.8 15.9Z" /></svg>
            </a>
            <a href="https://www.instagram.com/lockliel/" target="_blank" rel="noreferrer" aria-label="Follow Lockliel on Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.4" cy="6.7" r="1.2" /></svg>
            </a>
            <a href="https://www.youtube.com/@Lockliel" target="_blank" rel="noreferrer" aria-label="Follow Lockliel on YouTube" title="YouTube">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22.6 7.2s-.2-1.6-.9-2.3c-.9-.9-1.8-.9-2.3-1C16.2 3.7 12 3.7 12 3.7s-4.2 0-7.4.2c-.5.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S1.2 9 1.2 10.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.6.9 2.3c.9.9 2.1.9 2.6 1 1.9.2 7.1.2 7.1.2s4.2 0 7.4-.3c.5-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.8.2-3.6v-1.7c0-1.7-.2-3.5-.2-3.5ZM9.8 14.8V8.6l5.7 3.1-5.7 3.1Z" /></svg>
            </a>
            <a href="https://rumble.com/user/lockliel" target="_blank" rel="noreferrer" aria-label="Follow Lockliel on Rumble" title="Rumble">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 3.7c-.7-.4-1.5.1-1.5.9v14.8c0 .8.8 1.3 1.5.9l13.5-7.4c.7-.4.7-1.4 0-1.8L5.2 3.7Zm3.1 5.1 5.9 3.2-5.9 3.2V8.8Z" /></svg>
            </a>
          </nav>
        </div>
      </section>

      <footer>
        <div className="page-shell footer-grid">
          <div className="footer-brand">
            <img src="/lockliel-mark.png" alt="Lockliel" />
            <p>A global Christian platform being built to reach, teach, train, and disciple.</p>
          </div>
          <div>
            <span>Explore</span>
            <a href="#vision">The Vision</a>
            <a href="#videos">Watch Videos</a>
            <a href="#partner">Partnership</a>
          </div>
          <div>
            <span>Connect</span>
            <a href="mailto:info@lockliel.com">info@lockliel.com</a>
            <a href="tel:7853839568">785-383-9568</a>
            <a href="https://www.youtube.com/@Lockliel">YouTube</a>
          </div>
        </div>
        <div className="page-shell footer-bottom">
          <span>© 2026 Lockliel. All rights reserved.</span>
          <span>We love you. God loves you. The best is yet to come.</span>
        </div>
      </footer>
    </main>
  );
}
