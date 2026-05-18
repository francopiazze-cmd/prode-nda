import { redirect } from "next/navigation";

export default function ReferralRedirect({ params }: { params: { code: string } }) {
  redirect(`/registro?ref=${encodeURIComponent(params.code)}`);
}
