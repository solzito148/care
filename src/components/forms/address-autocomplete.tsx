"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

export type AddressSelection = {
  direccion: string;
  localidad: string;
  provincia: string;
};

type GeorefDireccion = {
  nomenclatura: string;
  localidad_censal?: { nombre?: string | null } | null;
  departamento?: { nombre?: string | null } | null;
  provincia?: { nombre?: string | null } | null;
};

const GEOREF_URL = "https://apis.datos.gob.ar/georef/api/direcciones";

type Props = {
  label?: string;
  value: string;
  hint?: string;
  className?: string;
  onChange: (value: string) => void;
  onSelect: (selection: AddressSelection) => void;
};

/**
 * Autocompletado de direcciones contra GeoRef (apis.datos.gob.ar), el servicio
 * oficial y gratuito de normalizacion geografica de Argentina. No requiere key.
 * Al elegir una sugerencia deriva localidad y provincia reales.
 * Si la API falla, el campo sigue funcionando como texto libre.
 */
export function AddressAutocomplete({
  label = "Dirección",
  value,
  hint,
  className,
  onChange,
  onSelect,
}: Props) {
  const [suggestions, setSuggestions] = useState<GeorefDireccion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const skipNextFetch = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputId = "turno-direccion";

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    const query = value.trim();
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (query.length < 4) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const url = `${GEOREF_URL}?direccion=${encodeURIComponent(query)}&max=8&campos=estandar`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("georef");
        const data = (await res.json()) as { direcciones?: GeorefDireccion[] };
        const found = data.direcciones ?? [];
        setSuggestions(found);
        setOpen(found.length > 0);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (direccion: GeorefDireccion) => {
    const localidad = direccion.localidad_censal?.nombre || direccion.departamento?.nombre || "";
    const provincia = direccion.provincia?.nombre || "";
    skipNextFetch.current = true;
    onChange(direccion.nomenclatura);
    onSelect({ direccion: direccion.nomenclatura, localidad, provincia });
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={boxRef} className={cn("relative block", className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-800">
        {label}
        <input
          id={inputId}
          value={value}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder="Calle y altura, ej: Av. Corrientes 1234"
          className="mt-2 min-h-12 w-full rounded-xl2 border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-care-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-care-200"
        />
      </label>
      {hint ? <span className="mt-1 block text-xs text-slate-600">{hint}</span> : null}
      {loading ? <span className="mt-1 block text-xs text-slate-500">Buscando direcciones…</span> : null}
      {open ? (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl2 border border-slate-200 bg-white py-1 shadow-lg">
          {suggestions.map((direccion, index) => (
            <li key={`${direccion.nomenclatura}-${index}`}>
              <button
                type="button"
                onClick={() => pick(direccion)}
                className="block w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-care-50"
              >
                {direccion.nomenclatura}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
