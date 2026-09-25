import Link from "next/link";
import ProfileForm from "./profile-form";
import "../my-lockliel.css";

export const metadata={title:"My Profile | My Lockliel"};

export default function Profile(){
  return <main className="my-lockliel"><div className="ml-auth-shell">
    <Link href="/my-lockliel" className="ml-auth-home">← My Lockliel</Link>
    <div className="ml-kicker">Your profile</div>
    <h1>Help us connect you well.</h1>
    <p>Your location helps us connect you with the right people and future Lockliel gatherings. Your private information is not displayed publicly.</p>
    <ProfileForm/>
    <div className="ml-profile-preferences-link">
      <Link href="/my-lockliel/security">Account security →</Link>
      <Link href="/my-lockliel/preferences">Communication preferences →</Link>
      <Link href="/my-lockliel/privacy">Privacy controls →</Link>
    </div>
  </div></main>;
}
