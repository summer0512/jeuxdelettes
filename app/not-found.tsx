'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import './globals.css';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="text-8xl font-bold">404</div>
        <h2 className="text-2xl font-semibold">Page introuvable</h2>
        <p className="text-muted-foreground">
          Désolé, la page que vous cherchez n’existe pas ou a été déplacée.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">Retour à l’accueil</Link>
        </Button>
      </div>
    </div>
  );
}
