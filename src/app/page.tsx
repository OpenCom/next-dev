'use client';
import { Button, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {

  // check if the user is logged in
  const { status } = useSession();

  const btnClasses = "rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44";
  

  return (
    <div>
      <main className="w-fit mx-auto flex justify-center min-h-[calc(100vh-100px)] items-center flex-col">
        {status === "authenticated" ? (
        <>
        <div className="flex gap-4 items-center flex-col sm:flex-row w-full">
          <Link
            className={`${btnClasses} hover:bg-[#d9d9d9] hover:text-black`}
            href="/trasferte"
          >
            VISUALIZZA TRASFERTE
          </Link>
          <Link
            className={`${btnClasses} hover:bg-[#d9d9d9] hover:text-black`}
            href="/progetti"
          >
            VISUALIZZA PROGETTI
          </Link>
          <Link
            className={`${btnClasses} hover:bg-[#d9d9d9] hover:text-black`}
            href="/trasferte/add"
          >
            CREA NUOVA TRASFERTA
          </Link>
          <Link
            className={`${btnClasses} hover:bg-[#d9d9d9] hover:text-black`}
            href="/progetti/add"
          >
            CREA NUOVO PROGETTO
          </Link>
        </div>
        <div className="flex justify-center mt-4 w-full">
          <Link
            className={`${btnClasses} hover:bg-[#383838] hover:text-white`}
            href="/report"
          >
            VEDI REPORT
          </Link>
        </div>
        </>
        ) : (
          <div className="flex flex-col gap-4 items-center">
          <Typography variant="h2" component="p" sx={{ flexGrow: 1 }}>
            Effettua il login per accedere al sistema
          </Typography>
          <Button href="/auth/login" size="large" variant="contained" color="primary">
            Login
          </Button>
          </div>
        )}
      </main>
    </div>
  );
}
