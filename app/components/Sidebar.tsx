"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RxPayLogo } from "./RxPayLogo";

const nav = [
  { href: "/", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/pre-auth", label: "Pre-Auth Queue", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/compliance", label: "Compliance", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-56 flex-shrink-0 border-r border-slate-700/50 bg-slate-900 text-white sidebar-scroll overflow-y-auto">
      <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-4">
        <RxPayLogo className="h-8 w-auto flex-shrink-0" />
        <span className="text-lg font-semibold text-white">RxPay</span>
      </div>
      <nav className="space-y-0.5 p-3">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-teal-500/20 text-teal-300" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700/50 p-3">
        <p className="text-xs text-slate-500">AI Copilot for TPA</p>
        <p className="text-xs text-slate-500">Claims • Pre-auth • Compliance</p>
      </div>
    </aside>
  );
}
