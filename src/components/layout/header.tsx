import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Ir al inicio de CARE">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-care-600 text-lg font-bold text-white">
            C
          </span>
          <span className="text-lg font-semibold text-slate-900">CARE</span>
        </Link>
        <div className="hidden text-sm text-slate-600 md:block">
          Gestión del cuidado de personas mayores
        </div>
        <div className="flex items-center gap-2">
          <Button href="/login" variant="secondary">
            Login
          </Button>
          <Button href="/registro">
            Registro
          </Button>
        </div>
      </div>
    </header>
  );
}
