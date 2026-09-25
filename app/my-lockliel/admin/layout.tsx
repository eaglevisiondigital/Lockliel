import AdminGate from "./admin-gate";

export default function AdminLayout({children}:{children:React.ReactNode}){
  return <AdminGate>{children}</AdminGate>;
}
