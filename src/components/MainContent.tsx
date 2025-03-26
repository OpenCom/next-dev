// components/global/MainContent.tsx
"use client"
import React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import cn from '@/lib/cn';
import Logo from "@/components/brand/Logo";

export default function MainContent({ children, pageTitle = 'Dashboard' }: { children: React.ReactNode, pageTitle?: string }) {
  const { isSidebarOpen } = useSidebar();

  return (
    <section
      className={cn(
        "flex flex-col transition-all duration-300 w-full",
        isSidebarOpen ? "md:max-w-[calc(100%_-_25vw_-_58px)]" : "md:max-w-full"
      )}
    >
      <header>
        <div className="py-2 px-4 mx-auto flex flex-row items-center gap-2 justify-between">
          <Logo />
          <nav>
            <ul className="flex flex-row list-none gap-4 text-sm text-slate-600 *:hover:underline">
              <li>Menu</li>
              <li>Profilo</li>
              <li>Impostazioni</li>
            </ul>
          </nav>
        </div>
        <div className="px-4 py-2 border-y border-slate-200 bg-slate-50">
          <div className="mx-auto flex flex-row items-center gap-2 justify-between font-semibold text-slate-700 font-[family-name:var(--font-geist-mono)]">
            <h1>{pageTitle}</h1>
          </div>
        </div>
      </header>
      <main className='p-4'>{children}</main>
    </section>
  );
}