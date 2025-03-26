"use client"
import React, { type MouseEvent } from 'react';
import { Icon } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import cn from '@/lib/cn';
import { useSidebar } from '@/context/SidebarContext';

function SidebarForm({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const sidebarButtonRef = React.useRef<HTMLButtonElement>(null);
  
  function handleToggle(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    toggleSidebar();
    
    if (sidebarButtonRef.current) {
      sidebarButtonRef.current.style.rotate = isSidebarOpen ? '180deg' : '0deg';
    }
  }
  
  return (
    <aside className="flex flex-row bg-slate-200 min-h-full">
      <div
        className={cn(
          "transition-all duration-300 w-full",
          isSidebarOpen ? "p-4 md:py-8 md:w-[25vw]" : "md:w-0"
        )}
      >
        <div
          aria-modal={isSidebarOpen}
          aria-hidden={!isSidebarOpen}
          className={cn(isSidebarOpen ? "block" : "hidden")}
        >
          {children}
        </div>
      </div>
      <div className="border-x border-slate-300 h-full p-2 flex-shrink-0">
        <button
          role="button"
          aria-label={`${isSidebarOpen ? "Nascondi" : "Apri"} la sidebar`}
          onClick={handleToggle}
          ref={sidebarButtonRef}
          className="bg-slate-300 rounded-full p-2 transition-transform duration-300 ease-out"
        >
          <Icon component={ArrowBackIcon} />
        </button>
      </div>
    </aside>
  );
}

export default SidebarForm;