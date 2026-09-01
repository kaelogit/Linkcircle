import type { Metadata } from "next";
import { Suspense } from "react";
import { IslandCampBalanceForm } from "@/components/IslandCampBalanceForm";

export const metadata: Metadata = {
  title: "Pay balance · LC Island Camp",
  description:
    "Complete your LC Island Camp balance payment before the registration deadline.",
};

export default function IslandCampBalancePage() {
  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto pb-24">
        <Suspense
          fallback={
            <p className="text-center text-sm text-ink/50">Loading…</p>
          }
        >
          <IslandCampBalanceForm />
        </Suspense>
      </section>
    </div>
  );
}
