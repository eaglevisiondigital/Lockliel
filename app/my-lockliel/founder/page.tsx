import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import FounderOrientationClient from "./founder-orientation-client";
import "../my-lockliel.css";

export const metadata={title:"Founders 50 Orientation | My Lockliel"};

export default function FounderPage(){
  return <main className="my-lockliel"><div className="ml-shell">
    <Link href="/my-lockliel" className="ml-auth-home"><ArrowLeft size={16}/> My Lockliel</Link>
    <FounderOrientationClient/>
  </div></main>;
}
