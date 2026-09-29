import Link from 'next/link';
import PersonClient from './person-client';
import '../../my-lockliel.css';
export const metadata={title:'My Five person | My Lockliel'};
export default function PersonPage(){return <main className="my-lockliel ml-person"><div className="ml-shell"><Link href="/my-lockliel/connections" className="ml-auth-home">← My Five & Connections</Link><PersonClient/></div></main>;}
