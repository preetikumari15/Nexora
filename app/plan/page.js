"use client";

import { Suspense } from "react";
import PlanInner from "./PlanInner";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <PlanInner />
    </Suspense>
  );
}
