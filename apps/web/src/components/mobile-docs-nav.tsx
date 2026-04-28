"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Menu, X } from "lucide-react";

interface MobileDocsNavProps {
  docs: { title: string; slug: string }[];
}

export function MobileDocsNav({ docs }: MobileDocsNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text"
      >
        <span>Documentation Menu</span>
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {isOpen && (
        <div className="mt-4 rounded-md border border-border bg-surface p-4">
          <Sidebar docs={docs} className="w-full" />
        </div>
      )}
    </div>
  );
}
