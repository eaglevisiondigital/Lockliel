import { ArrowUpRight } from "lucide-react";

export default function Founders50Invitation() {
  return (
    <section className="founders-invitation" id="founders-50" aria-labelledby="founders-invitation-title">
      <div className="page-shell founders-invitation-grid">
        <div className="founders-invitation-art">
          <img src="/bright-home-small-group.png" alt="People gathering in a home for conversation and Bible study" width="1536" height="1024" loading="lazy" />
          <div><strong>50</strong><span>Founding hosts.<br />One shared mission.</span></div>
        </div>
        <div className="founders-invitation-copy">
          <p className="founders-invitation-kicker">What if God wants to use your living room?</p>
          <h2 id="founders-invitation-title">We're looking for<br /><em>the Founders 50.</em></h2>
          <p>50 ordinary believers across America, Canada, and other English-speaking countries willing to gather people, share Faith Boost, reach their communities, and help us build a movement of disciples who make disciples.</p>
          <ul><li>No building required.</li><li>No title required.</li><li>Start with two.</li></ul>
          <a className="button button-primary" href="/founders-50">Discover the Founders 50 <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
