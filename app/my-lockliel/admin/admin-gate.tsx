"use client";
import StaffSecurityGate from "../staff-security-gate";

const ADMIN_ROLES=[
  "super_admin",
  "admin",
  "discipleship_admin",
  "founders50_reviewer",
  "finance_admin",
  "content_admin"
];

export default function AdminGate({children}:{children:React.ReactNode}){
  return <StaffSecurityGate allowedRoles={ADMIN_ROLES} returnTo="/my-lockliel/admin">
    {children}
  </StaffSecurityGate>;
}
