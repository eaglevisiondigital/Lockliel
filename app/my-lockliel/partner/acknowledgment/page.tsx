import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import GiftAcknowledgmentClient from "./gift-acknowledgment-client";
import "../../my-lockliel.css";

export const metadata={title:"Gift Acknowledgment | My Lockliel"};

export default function GiftAcknowledgmentPage(){
  return <main className="my-lockliel"><div className="ml-shell">
    <Link href="/my-lockliel/partner" className="ml-auth-home"><ArrowLeft size={16}/> Partnership</Link>
    <GiftAcknowledgmentClient/>
  </div></main>;
}
