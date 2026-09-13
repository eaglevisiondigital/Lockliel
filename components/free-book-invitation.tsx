import styles from "./free-book-invitation.module.css";
export default function FreeBookInvitation() {
  return <aside className={styles.invitation} aria-labelledby="free-book-invitation-title"><img src="/faith-boost-resource/cover.jpg" width={1055} height={1491} loading="lazy" alt="You Are Who God Says You Are — free Faith Boost digital book"/><div><p className={styles.eyebrow}>Free Faith Boost resource</p><h3 id="free-book-invitation-title">Stop letting life name you.</h3><p>Your past doesn’t define you. Your circumstances don’t get the final say. Discover seven biblical truths about who God says you are.</p><a className="button button-primary" href="/who-god-says-you-are?source=faith-boost-home">Get the free digital book <span aria-hidden="true">↗</span></a></div></aside>;
}
