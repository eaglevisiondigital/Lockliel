import { notFound } from 'next/navigation';
import { localMemberReviewEnabled, localShareReviewEnabled, localPrivacyReviewEnabled, localMemberReadReviewEnabled } from '../../../lib/member-review/review-policy';
import MemberReviewShell from '../../../components/member-review/member-review-shell';

export const metadata = {title:'My Lockliel | Local member review',robots:{index:false,follow:false}};
export default function LocalMemberReviewPage(){
  if(!localMemberReviewEnabled({flag:process.env.LOCKLIEL_MEMBER_REVIEW,context:process.env.CONTEXT,netlify:process.env.NETLIFY})) notFound();
  return <MemberReviewShell offlineReadEnabled={localMemberReadReviewEnabled({flag:process.env.LOCKLIEL_MEMBER_READ_REVIEW,memberFlag:process.env.LOCKLIEL_MEMBER_REVIEW,context:process.env.CONTEXT,netlify:process.env.NETLIFY})} shareReviewEnabled={localShareReviewEnabled({flag:process.env.LOCKLIEL_SHARE_REVIEW,memberFlag:process.env.LOCKLIEL_MEMBER_REVIEW,context:process.env.CONTEXT,netlify:process.env.NETLIFY})} privacyReviewEnabled={localPrivacyReviewEnabled({flag:process.env.LOCKLIEL_PRIVACY_REVIEW,memberFlag:process.env.LOCKLIEL_MEMBER_REVIEW,context:process.env.CONTEXT,netlify:process.env.NETLIFY})}/>;
}
