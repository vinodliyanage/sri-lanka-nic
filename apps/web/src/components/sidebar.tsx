"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
interface SidebarProps {
  docs: { title: string; slug: string }[];
}

export function Sidebar({ docs }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0">
      <ul className="space-y-0.5">
        {docs.map((doc) => {
          const href = `/docs/${doc.slug}`;
          const isActive = pathname === href;

          return (
            <li key={doc.slug}>
              <Link
                href={href}
                className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-bg-secondary font-medium text-text"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                {doc.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
