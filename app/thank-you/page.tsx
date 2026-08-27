export const metadata = {
  title: "Thank You | Lockliel",
  description: "Thank you for staying connected with the vision of Lockliel.",
};

export default function ThankYouPage() {
  return (
    <main className="thank-you-page">
      <div className="thank-you-glow" aria-hidden="true" />
      <section className="thank-you-card">
        <a className="thank-you-brand" href="/" aria-label="Return to the Lockliel home page">
          <img src="/lockliel-mark.png" alt="" />
          <span>Lockliel</span>
        </a>
        <div className="thank-you-check" aria-hidden="true">✓</div>
        <p className="section-kicker light">You’re on the list</p>
        <h1>Thank you for standing with the vision.</h1>
        <p>
          Your information has been received securely. We’ll keep you connected
          and let you know when Lockliel’s giving opportunities go live.
        </p>
        <div className="thank-you-actions">
          <a className="button button-primary" href="/">Return to Lockliel</a>
          <a className="button button-ghost" href="/#videos">Watch the Vision</a>
        </div>
        <small>No phone number was collected. Your information will only be used for Lockliel updates.</small>
      </section>
    </main>
  );
}
