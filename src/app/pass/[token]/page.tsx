import type { Metadata } from "next";
import { PassView } from "@/components/PassView";

type Props = { params: Promise<{ token: string }> };

export const metadata: Metadata = {
  title: "Your Access Pass",
  robots: { index: false, follow: false },
};

export default async function PassPage({ params }: Props) {
  const { token } = await params;
  return <PassView token={token} />;
}
