// src/app/share-target/page.js
import { Suspense } from "react";
import ShareTargetClientComponent from "./ShareTargetClientComponent";
import SkeletonLoader from "@/components/SkeletonLoader"; // Usando seu SkeletonLoader

export default function ShareTargetPage() {
  return (
    <div className="flex items-center justify-center flex-grow p-4">
      <Suspense fallback={<SkeletonLoader type="card" />}>
        <ShareTargetClientComponent />
      </Suspense>
    </div>
  );
}
