"use client";

import { Suspense } from "react";
import ResultInner from "./ResultInner";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ResultInner />
    </Suspense>
  );
}
