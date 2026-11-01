import { notFound } from 'next/navigation';
import { localMemberReviewEnabled, localShareReviewEnabled, localPrivacyReviewEnabled, localMemberReadReviewEnabled, localMemberServerReadReviewEnabled } from '../../../lib/member-review/review-policy';
import {expectedIsolatedReadBinding} from '../../../lib/member-server-read/validation';
import MemberReviewShell from '../../../components/member-review/member-review-shell';

export const metadata = {title:'My Lockliel | Local member review',robots:{index:false,follow:false}};
export default function LocalMemberReviewPage(){
  if(!localMemberReviewEnabled({flag:process.env.LOCKLIEL_MEMBER_REVIEW,context:process.env.CONTEXT,netlify:process.env.NETLIFY})) notFound();
  return <MemberReviewShell serverReadEnabled={localMemberServerReadReviewEnabled({flag:process.env.LOCKLIEL_MEMBER_SERVER_READ_REVIEW,memberFlag:process.env.LOCKLIEL_MEMBER_REVIEW,context:process.env.CONTEXT,netlify:process.env.NETLIFY})} serverReadBinding={expectedIsolatedReadBinding({deploy:process.env.LOCKLIEL_ISOLATED_READ_DEPLOY,source:process.env.LOCKLIEL_ISOLATED_READ_SOURCE})} offlineReadEnabled={localMemberReadReviewEnabled({flag:process.env.LOCKLIEL_MEMBER_READ_REVIEW,memberFlag:process.env.LOCKLIEL_MEMBER_REVIEW,context:process.env.CONTEXT,netlify:process.env.NETLIFY})} shareReviewEnabled={localShareReviewEnabled({flag:process.env.LOCKLIEL_SHARE_REVIEW,memberFlag:process.env.LOCKLIEL_MEMBER_REVIEW,context:process.env.CONTEXT,netlify:process.env.NETLIFY})} privacyReviewEnabled={localPrivacyReviewEnabled({flag:process.env.LOCKLIEL_PRIVACY_REVIEW,memberFlag:process.env.LOCKLIEL_MEMBER_REVIEW,context:process.env.CONTEXT,netlify:process.env.NETLIFY})}/>;
}
