import Link from 'next/link';
import OnboardingClient from './onboarding-client';
import '../my-lockliel.css';
export const metadata={title:'Welcome | My Lockliel'};
export default function OnboardingPage(){
  return <main className="my-lockliel"><div className="ml-auth-shell ml-onboarding-shell"><Link className="ml-auth-home" href="/my-lockliel">← My Lockliel</Link><OnboardingClient/></div></main>;
}
