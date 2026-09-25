import PersonRecordClient from "./person-record-client";
import "../../my-lockliel.css";

export const metadata={title:"Person Record | Lockliel Admin"};

export default function PersonRecordPage(){
  return <main className="my-lockliel"><div className="ml-shell"><PersonRecordClient/></div></main>;
}
