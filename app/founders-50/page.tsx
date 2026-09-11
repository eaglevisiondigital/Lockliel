import type { Metadata } from "next";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, Heart, MessageCircle, Play, Users } from "lucide-react";
import Founders50Form from "@/components/founders50-form";
import "./founders.css";

export const metadata: Metadata = {
  title: "The Founders 50 | Help Begin the Lockliel Movement",
  description: "Share with five. Gather a few. Reach your community. We're looking for the first 50 people across America to help build Lockliel from the ground up.",
  alternates: { canonical: "https://lockliel.com/founders-50" },
  openGraph: {
    title: "The Lockliel Founders 50",
    description: "50 ordinary believers. A shared mission. Share with five, gather a few, and help people become disciples who reach others.",
    url: "https://lockliel.com/founders-50",
    type: "website",
  },
};

const rhythm = [
  { word: "Connect", copy: "Share a meal, have coffee, and encourage each other." },
  { word: "Watch", copy: "Watch or revisit a Faith Boost message together." },
  { word: "Talk", copy: "What stood out? What does Scripture say?" },
  { word: "Act", copy: "Choose one thing to put into practice this week." },
  { word: "Multiply", copy: "Who can you encourage, reach, or invite next?" },
];

const foundations = [
  { number: "01", title: "Who God is.", copy: "God is good. He loves you. He has a purpose for your life." },
  { number: "02", title: "Who you are in Christ.", copy: "Your past, failures, circumstances, and battles don't define you. God's Word does." },
  { number: "03", title: "What you have in Christ.", copy: "God hasn't left you powerless or empty-handed. Discover what you have received in Him." },
  { number: "04", title: "What you can do through Christ.", copy: "Live differently. Overcome. Serve. Share your testimony, pray for people, and make disciples." },
];

const resources = [
  { icon: Play, title: "Teaching to build on", copy: "Faith Boost teaching, weekly discussion and activation guides, and prayer resources." },
  { icon: Users, title: "Support for your gathering", copy: "A Founder / Facilitator Guide, invitation and share materials, and physical Founders materials as they develop." },
  { icon: BookOpen, title: "Tools to help people grow", copy: "Evangelism tools, discipleship resources, and digital materials you can put into people's hands." },
  { icon: MessageCircle, title: "A team walking with you", copy: "Leader training and regular communication with Dave and the Lockliel team, with future access to group and disciple-making technology." },
];

export default function Founders50Page() {
  return (
    <main className="f50-page" id="top">
      <a className="f50-skip" href="#founders-main">Skip to content</a>
      <header className="f50-header">
        <a className="brand" href="/" aria-label="Lockliel home"><img src="/lockliel-mark.png" alt="" width="44" height="44" /><span>Lockliel</span></a>
        <nav aria-label="Founders 50 navigation">
          <a href="/#vision">The Vision</a>
          <a href="#what-it-involves">What's involved</a>
          <a href="/#faith-boost">Faith Boost</a>
        </nav>
        <a className="f50-header-cta" href="#apply">Express interest <ArrowUpRight size={16} aria-hidden="true" /></a>
      </header>

      <section className="f50-hero" id="founders-main" aria-labelledby="founders-title">
        <div className="page-shell f50-hero-grid">
          <div className="f50-hero-copy">
            <p className="f50-eyebrow">A ground floor opportunity</p>
            <h1 id="founders-title">The Founders <em>50.</em></h1>
            <h2>We're looking for 50 people ready to reach their world.</h2>
            <p className="f50-lead">People across America who love Jesus, believe the Bible, love people, and are willing to gather a few and help something grow.</p>
            <p className="f50-hero-reassurance">You don't need a building, a title, or a large following.</p>
            <div className="f50-actions">
              <a className="button button-primary" href="#apply">I'm interested in becoming one of the 50 <ArrowUpRight size={18} aria-hidden="true" /></a>
              <a className="f50-text-link" href="#what-it-involves">Learn what's involved <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
          </div>
          <figure className="f50-hero-photo">
            <img src="/living-room-small-group-v2.png" alt="A small group sharing Scripture and conversation in a living room" width="1448" height="1086" fetchPriority="high" />
            <figcaption>
              <strong>50</strong>
              <div><span>The first founding hosts</span><p>Across America.<br />United by one mission.</p></div>
            </figcaption>
          </figure>
        </div>
        <div className="page-shell f50-mission-strip" aria-label="Our mission">
          {["Reach", "Teach", "Train", "Disciple", "Multiply"].map((word, index) => <span key={word}><small>0{index + 1}</small>{word}</span>)}
        </div>
      </section>

      <section className="f50-opening f50-section">
        <div className="page-shell f50-two-column">
          <div><p className="f50-eyebrow">Right where you already are</p><h2 className="f50-heading">You don't need a pulpit<br />to make a difference.</h2></div>
          <div className="f50-opening-copy">
            <p>Somewhere around you are people who need hope. Some know Jesus and need encouragement. Others have never really understood the Gospel.</p>
            <div className="f50-people" aria-label="People you can reach"><span>Friends</span><span>Neighbors</span><span>Coworkers</span><span>Family</span></div>
            <p>Lockliel is putting simple, powerful tools into the hands of ordinary believers so people can discover who God says they are and take their next step.</p>
            <strong>Your relationships can be the beginning.</strong>
          </div>
        </div>
      </section>

      <section className="f50-commitments f50-section" id="what-it-involves" aria-labelledby="commitments-title">
        <div className="page-shell">
          <div className="f50-section-intro"><p className="f50-eyebrow">A simple place to start</p><h2 className="f50-heading" id="commitments-title">Share with five.<br /><em>Gather a few.</em></h2><p>Four simple ways to begin reaching people and building relationships each week.</p></div>
          <div className="f50-commitment-grid">
            <article className="f50-commitment">
              <div className="f50-card-photo"><img src="/lockliel-share-from-anywhere.png" alt="Two people sharing a message on a phone over coffee" width="1536" height="1024" loading="lazy" /><span>01 / Make it personal</span></div>
              <div className="f50-card-copy"><h3>Share with five.</h3><p>Personally send a Faith Boost broadcast or Lockliel resource to at least five people each week. Think of actual people who could use the message, and reach out to them directly.</p><strong>Who are your five?</strong></div>
            </article>
            <article className="f50-commitment">
              <div className="f50-card-photo"><img src="/bright-home-small-group.png" alt="A small group learning together in a home" width="1536" height="1024" loading="lazy" /><span>02 / Open the door</span></div>
              <div className="f50-card-copy"><h3>Gather a few.</h3><p>Invite people to gather once a week. Begin with two, three, five, or ten people in your home, a coffee shop, an office, a restaurant, or a community space.</p><strong>Start with who you have.</strong></div>
            </article>
            <article className="f50-commitment f50-watch-card">
              <div className="f50-watch-visual"><Play size={38} aria-hidden="true" /><div><span>Faith Boost Broadcast</span><strong>7 PM <small>Central</small></strong></div><span className="f50-watch-index">03</span></div>
              <div className="f50-card-copy"><h3>Watch Faith Boost together.</h3><p>Choose one, two, or three messages from the week that speak to your people. Watch together or discuss what everyone learned. Your group doesn't need to gather for every broadcast.</p><a className="f50-text-link" href="/#faith-boost">Explore Faith Boost <ArrowUpRight size={16} aria-hidden="true" /></a></div>
            </article>
            <article className="f50-commitment">
              <div className="f50-card-photo"><img src="/prayer-leading-someone.png" alt="Two people praying together" width="1536" height="1024" loading="lazy" /><span>04 / Take the next step</span></div>
              <div className="f50-card-copy"><h3>Connect. Discuss. Pray.</h3><p>Make space for honest conversation. Open Scripture, encourage each other, pray together, and help someone put what they've learned into practice.</p><strong>Keep it relational. Keep it simple.</strong></div>
            </article>
          </div>
          <div className="f50-rhythm">
            <div className="f50-rhythm-heading"><p className="f50-eyebrow">Your gathering rhythm</p><p>People, the Word, and one next step.</p></div>
            <ol>{rhythm.map(({word, copy}, index) => <li key={word}><span className="f50-rhythm-number">0{index + 1}</span><h3>{word}</h3><p>{copy}</p></li>)}</ol>
            <p className="f50-rhythm-close"><Heart size={18} aria-hidden="true" /> Then pray together.</p>
          </div>
        </div>
      </section>

      <section className="f50-support f50-section" id="support" aria-labelledby="support-title">
        <div className="page-shell">
          <div className="f50-two-column f50-support-intro">
            <div><p className="f50-eyebrow">You won't be doing this alone</p><h2 className="f50-heading" id="support-title">You don't have<br />to be a preacher.</h2></div>
            <div><p>Gather people. Love them. Facilitate conversation. Point them toward Scripture. Encourage them, pray together, and help them take their next step.</p><p>You aren't expected to prepare sermons or have every theological answer.</p><strong>Anybody can host. Leaders are developed.</strong></div>
          </div>
          <div className="f50-resources-heading"><h3>What we're building for Founders.</h3><p>As the movement develops, Lockliel intends to provide:</p></div>
          <div className="f50-resource-grid">{resources.map(({icon: Icon, title, copy}) => <article key={title}><Icon size={26} strokeWidth={1.5} aria-hidden="true" /><h4>{title}</h4><p>{copy}</p></article>)}</div>
          <p className="f50-support-note">Resources, training, and technology will grow alongside the movement. Founders will help shape what comes next.</p>
        </div>
      </section>

      <section className="f50-foundations f50-section" aria-labelledby="foundations-title">
        <div className="page-shell">
          <div className="f50-section-intro"><p className="f50-eyebrow">Rooted in the Word. Ready to live it.</p><h2 className="f50-heading" id="foundations-title">Know Jesus.<br />Discover who you are in Him.</h2><p>Faith Boost and Lockliel help people build their lives on four biblical foundations.</p></div>
          <div className="f50-foundation-grid">{foundations.map(({number, title, copy}) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
          <div className="f50-live-it"><strong>Live it.</strong><ArrowRight aria-hidden="true" /><strong>Share it.</strong><ArrowRight aria-hidden="true" /><strong>Help someone else live it.</strong></div>
        </div>
      </section>

      <section className="f50-kingdom f50-section">
        <div className="page-shell f50-two-column">
          <div><p className="f50-eyebrow">One Kingdom. One mission.</p><h2 className="f50-heading">People matter.<br /><em>People need Jesus.</em></h2><p>Our focus is Jesus, His Word, and reaching people. We want to meet people where they are, establish them in biblical truth, and equip them to help somebody else.</p></div>
          <div className="f50-church-note"><BookOpen size={28} aria-hidden="true" /><h3>Already part of a great local church? Wonderful. Stay connected.</h3><p>Lockliel isn't asking you to leave your church. We want to equip you to take the Gospel and discipleship into the relationships and communities where you already live.</p><p className="f50-denominations">Bible-believing Christians from Baptist, Methodist, Pentecostal, charismatic, Word of Faith, nondenominational, and other backgrounds are welcome.</p></div>
        </div>
      </section>

      <section className="f50-founding f50-section" aria-labelledby="founding-title">
        <div className="page-shell f50-two-column">
          <div><p className="f50-eyebrow">Why the first 50 matter</p><h2 className="f50-heading" id="founding-title">Help us build it<br /><em>from the ground up.</em></h2><p>The first 50 are helping establish the foundation. Your experience and feedback will shape the resources, training, and technology that could serve thousands of future gatherings.</p><p className="f50-founding-statement">Someday there could be thousands of Lockliel gatherings around the world. We're looking for the first 50 people willing to help us start.</p></div>
          <div className="f50-feedback"><span className="f50-feedback-label">Your experience helps shape the future</span><div><span>01</span><p>What helps people grow and reach others?</p></div><div><span>02</span><p>What questions are people asking?</p></div><div><span>03</span><p>What makes gathering easier?</p></div><div><span>04</span><p>What resources and technology would help most?</p></div></div>
        </div>
      </section>

      <section className="f50-multiply f50-section" aria-labelledby="multiply-title">
        <div className="page-shell">
          <div className="f50-multiply-top"><div><p className="f50-eyebrow">The vision is multiplication</p><h2 className="f50-heading" id="multiply-title">Grow people<br />who can reach people.</h2></div><p>Every Founder can help someone else become a facilitator or leader. That's how the mission can move from one gathering into more communities.</p></div>
          <div className="f50-multiply-flow"><div className="f50-multiply-seed"><strong>50</strong><span>Founding hosts.<br />A shared mission.</span></div><ol>{["People", "Disciples", "Leaders", "More groups", "More communities"].map((word, i) => <li key={word}><span>0{i + 1}</span><strong>{word}</strong></li>)}</ol></div>
          <p className="f50-multiply-question">What happens when 50 people decide to reach people, and teach those people to do the same?</p>
          <p className="f50-multiply-answer">We don't know how far it can go. But that's how movements begin.</p>
        </div>
      </section>

      <section className="f50-apply f50-section" id="apply" aria-labelledby="apply-title">
        <div className="page-shell f50-apply-grid">
          <div className="f50-apply-copy"><p className="f50-eyebrow">Raise your hand</p><h2 className="f50-heading" id="apply-title">Be there<br /><em>at the beginning.</em></h2><p>You can start with a willing heart and a few people. Tell us about yourself and where you could begin.</p><ul><li><Check size={18} aria-hidden="true" /> Share with five each week.</li><li><Check size={18} aria-hidden="true" /> Gather a few once a week.</li><li><Check size={18} aria-hidden="true" /> Learn and help us build.</li></ul><div className="f50-next-step"><span>What happens next?</span><p>The Lockliel team will review your interest and contact you about next steps. Submitting this form does not automatically make you an approved Founder.</p></div></div>
          <Founders50Form />
        </div>
      </section>

      <footer className="f50-footer"><div className="page-shell"><a className="brand" href="/" aria-label="Lockliel home"><img src="/lockliel-mark.png" alt="" width="40" height="40" /><span>Lockliel</span></a><p>Reach. Teach. Train. Disciple. Multiply.</p><nav aria-label="Footer navigation"><a href="/">The Lockliel vision</a><a href="/#faith-boost">Faith Boost</a><a href="mailto:info@lockliel.com">Contact us</a></nav><small>© 2026 Lockliel. All rights reserved.</small></div></footer>
    </main>
  );
}
