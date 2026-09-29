import LessonPlayerClient from "./lesson-player-client";
import "../../my-lockliel.css";

export const metadata={title:"Lesson | My Lockliel"};

export default function LessonPage(){
  return <main className="my-lockliel"><div className="ml-shell"><LessonPlayerClient/></div></main>;
}
