import { notFound } from 'next/navigation';
import { localMemberReviewEnabled } from '../../../lib/member-review/review-policy';
import MemberReviewShell from '../../../components/member-review/member-review-shell';

export const metadata = {title:'My Lockliel | Local member review',robots:{index:false,follow:false}};
export default function LocalMemberReviewPage(){
  if(!localMemberReviewEnabled({flag:process.env.LOCKLIEL_MEMBER_REVIEW,context:process.env.CONTEXT,netlify:process.env.NETLIFY})) notFound();
  return <MemberReviewShell/>;
}
