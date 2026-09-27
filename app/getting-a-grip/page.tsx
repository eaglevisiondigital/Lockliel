import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import definition from "@/content/share-library/getting-a-grip.json";
import styles from "./page.module.css";

const {asset}=definition;
export const metadata:Metadata={title:`${asset.title} | Lockliel`,description:asset.description};

export default function GettingAGripInvitation(){
  return <div className={styles.page}>
    <header className={styles.header}><Link href="/" className={styles.brand} aria-label="Lockliel home"><Image src="/lockliel-mark.png" alt="" width={44} height={44}/><span>Lockliel<small>Reach. Teach. Train. Disciple.</small></span></Link></header>
    <main className={styles.main}>
      <p className={styles.eyebrow}>A biblical foundation, one step at a time</p>
      <h1>{asset.title}</h1>
      <p className={styles.description}>{asset.description}</p>
      <section className={styles.card} aria-labelledby="continue-heading">
        <p className={styles.eyebrow}>13 lessons · Scripture-based</p>
        <h2 id="continue-heading">Continue through My Lockliel</h2>
        <p>Create your My Lockliel account to take your next step. Already a member? Sign in to continue your journey.</p>
        <Link className={styles.primary} href="/my-lockliel/sign-up">Start Getting a Grip</Link>
        <Link className={styles.secondary} href="/my-lockliel/sign-in">Already have an account? Sign in</Link>
      </section>
    </main>
    <footer className={styles.footer}>Lockliel · Reach. Teach. Train. Disciple.</footer>
  </div>;
}
