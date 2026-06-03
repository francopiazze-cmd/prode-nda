import AdminClient from "./AdminClient";

export const metadata = {
  title: "Panel · Candela Pole",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
