import "@/app/globals.css";

import ExpenseForm from '@/components/forms/ExpenseForm';
import SidebarForm from "@/components/global/SidebarForm";

import { SidebarProvider } from "@/context/SidebarContext";
import MainContent from "@/components/MainContent";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <>
      <div className="w-full flex flex-col md:flex-row min-h-svh bg-slate-100">
        <SidebarProvider>
          <SidebarForm>
            <ExpenseForm />
          </SidebarForm>
          <MainContent pageTitle="Test UI">
            {children}
          </MainContent>
        </SidebarProvider>
      </div>
      <footer className="text-center p-4 w-full bg-slate-200 text-slate-600 border-t border-slate-300">
        <p>PDM Power by OpenCom - Copyright © 2014-2025</p>
      </footer>
    </>
  );
}
