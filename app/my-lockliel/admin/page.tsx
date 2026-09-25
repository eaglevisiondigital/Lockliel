import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import AdminClient from "./admin-client";
import AdminSectionNav from "./admin-section-nav";
import ContentAdminClient from "./content-admin-client";
import FinanceAdminClient from "./finance-admin-client";
import FounderOrientationAdminClient from "./founder-orientation-admin-client";
import FounderReviewAdminClient from "./founder-review-admin-client";
import GroupsAdminClient from "./groups-admin-client";
import LeadersAdminClient from "./leaders-admin-client";
import LeadsAdminClient from "./leads-admin-client";
import LineageAdminClient from "./lineage-admin-client";
import NotesAdminClient from "./notes-admin-client";import OrdersAdminClient from "./orders-admin-client";
import PeopleProgressClient from "./people-progress-client";
import PrivacyAdminClient from "./privacy-admin-client";
import ProductsAdminClient from "./products-admin-client";
import ReadinessAdminClient from "./readiness-admin-client";
import RolesAdminClient from "./roles-admin-client";
import ShareLibraryAdminClient from "./share-library-admin-client";
import SystemAdminClient from "./system-admin-client";
import TasksAdminClient from "./tasks-admin-client";
import "../my-lockliel.css";

export const metadata={title:"Lockliel Admin"};

export default function Admin(){
  return <main className="my-lockliel"><div className="ml-shell">
    <Link href="/my-lockliel" className="ml-auth-home"><ArrowLeft size={16}/> My Lockliel</Link>

    <section className="ml-panel">
      <div className="ml-kicker">Lockliel Admin</div>
      <h1 style={{fontSize:"clamp(38px,6vw,68px)",margin:"10px 0"}}>People. Progress. Follow-up.</h1>
      <p>Authorized leaders see only what their role permits. Financial and private discipleship data remain separated.</p>
    </section>

    <AdminSectionNav/>

    <section id="overview" className="ml-admin-section">
      <h2 className="ml-section-title">At a glance</h2>
      <AdminClient/>
      <h2 className="ml-section-title">Launch readiness</h2>
      <ReadinessAdminClient/>
    </section>

    <section id="pipeline" className="ml-admin-section">
      <h2 className="ml-section-title">Lead pipeline</h2>
      <LeadsAdminClient/>
      <h2 className="ml-section-title">Follow-up operations</h2>
      <TasksAdminClient/>
    </section>

    <section id="people" className="ml-admin-section">
      <h2 className="ml-section-title">Multiplication lineage</h2>
      <LineageAdminClient/>
      <h2 className="ml-section-title">People & progress</h2>
      <PeopleProgressClient/>
      <h2 className="ml-section-title">Private staff notes</h2>
      <NotesAdminClient/>
    </section>

    <section id="founders" className="ml-admin-section">
      <h2 className="ml-section-title">Founder review</h2>
      <FounderReviewAdminClient/>
      <h2 className="ml-section-title">Founder orientation</h2>
      <FounderOrientationAdminClient/>
    </section>

    <section id="leaders" className="ml-admin-section">
      <h2 className="ml-section-title">Leaders & mentoring</h2>
      <LeadersAdminClient/>
      <h2 className="ml-section-title">Groups & local connections</h2>
      <GroupsAdminClient/>
    </section>

    <section id="discipleship" className="ml-admin-section">
      <h2 className="ml-section-title">Discipleship content</h2>
      <ContentAdminClient/>
      <h2 className="ml-section-title">Share Library</h2>
      <ShareLibraryAdminClient/>
    </section>

    <section id="resources" className="ml-admin-section">
      <h2 className="ml-section-title">Books & digital products</h2>
      <ProductsAdminClient/>
      <h2 className="ml-section-title">Finance & resources</h2>
      <FinanceAdminClient/>
    </section>

    <section id="access" className="ml-admin-section">
      <h2 className="ml-section-title">Staff roles</h2>
      <RolesAdminClient/>
      <h2 className="ml-section-title">Privacy requests</h2>
      <PrivacyAdminClient/>
      <h2 className="ml-section-title">System controls</h2>
      <SystemAdminClient/>
    </section>
  </div></main>;
}
