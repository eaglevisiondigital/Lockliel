import type { Metadata } from "next";
import ResourceReady from "@/components/resource-ready";
export const metadata: Metadata = { title: "Your Book Is Ready | Lockliel", robots: { index: false, follow: false } };
export default function ReadPage() { return <ResourceReady/>; }
