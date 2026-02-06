import { Suspense } from "react";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <CatalogClient />
    </Suspense>
  );
}
