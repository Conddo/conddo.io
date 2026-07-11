import { redirect } from "next/navigation";

/** studio.getconddo.com/ → /admin/dashboard. Keeps the subdomain root useful. */
export default function AdminIndex() {
  redirect("/admin/dashboard");
}
