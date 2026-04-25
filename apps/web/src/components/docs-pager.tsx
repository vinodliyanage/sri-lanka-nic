"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DocsPagerProps {
  docs: { title: string; slug: string }[];
}

export function DocsPager({ docs }: DocsPagerProps) {
  const pathname = usePathname();

  // Get the current slug from the URL.
  // Example: '/docs/getting-started' -> 'getting-started'
  const currentSlug = pathname.split("/").pop();
  const currentIndex = docs.findIndex((doc) => doc.slug === currentSlug);

  // If the current path is not in the docs nav array, we don't render the pager.
  if (currentIndex === -1) {
    return null;
  }

  const prevDoc = currentIndex > 0 ? docs[currentIndex - 1] : null;
  const nextDoc = currentIndex < docs.length - 1 ? docs[currentIndex + 1] : null;

  return (
    <div className="mt-16 flex items-center justify-between border-t border-border pt-8 pb-8">
      {prevDoc ? (
        <Link
          href={`/docs/${prevDoc.slug}`}
          className="group flex flex-col gap-1 text-sm font-medium transition-colors"
        >
          <span className="flex items-center gap-1 text-xs text-text-muted transition-colors group-hover:text-text-secondary">
            <ChevronLeft size={14} />
            Previous
          </span>
          <span className="text-text-secondary transition-colors group-hover:text-text">
            {prevDoc.title}
          </span>
        </Link>
      ) : (
        <div /> // Empty div to keep the 'Next' button aligned to the right when there's no 'Previous'
      )}

      {nextDoc && (
        <Link
          href={`/docs/${nextDoc.slug}`}
          className="group flex flex-col items-end gap-1 text-sm font-medium transition-colors"
        >
          <span className="flex items-center gap-1 text-xs text-text-muted transition-colors group-hover:text-text-secondary">
            Next
            <ChevronRight size={14} />
          </span>
          <span className="text-text-secondary transition-colors group-hover:text-text">
            {nextDoc.title}
          </span>
        </Link>
      )}
    </div>
  );
}
