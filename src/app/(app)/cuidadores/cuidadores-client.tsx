"use client";

import { useMemo, useState } from "react";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CaregiverSearchItem } from "@/lib/cuidadores-types";

const modalityFilters = [
  "Con retiro",
  "Sin retiro",
  "Por hora",
  "Jornada completa",
  "Noches",
  "Guardia 24 hs",
  "Reemplazos",
];

const availabilityFilters = ["Sabados", "Domingos", "Feriados"];
const taskFilters = [
  "Adultos mayores",
  "Alzheimer/demencia",
  "Movilidad reducida",
  "Higiene personal",
  "Administracion de medicacion",
  "Preparacion de comidas",
];

type Props = {
  caregivers: CaregiverSearchItem[];
};

export function CuidadoresClient({ caregivers }: Props) {
  const [zona, setZona] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [minCalificacion, setMinCalificacion] = useState("0");
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [flags, setFlags] = useState({
    referenciasCargadas: false,
    referenciasVerificadas: false,
    recomendadoCare: false,
    datosActualizados: false,
  });

  const filtered = useMemo(() => {
    return caregivers.filter((item) => {
      if (zona && !item.zonasTrabajo.some((z) => z.toLowerCase().includes(zona.toLowerCase()))) return false;
      if (localidad && !item.localidad.toLowerCase().includes(localidad.toLowerCase())) return false;
      if (item.calificacion < Number(minCalificacion || 0)) return false;
      if (selectedModalities.length > 0 && !selectedModalities.every((m) => item.modalidades.includes(m))) return false;
      if (selectedAvailability.length > 0 && !selectedAvailability.every((d) => item.disponibilidadEspecial.includes(d))) return false;
      if (selectedTasks.length > 0 && !selectedTasks.every((t) => item.tareas.includes(t))) return false;
      if (flags.referenciasCargadas && !item.referenciasCargadas) return false;
      if (flags.referenciasVerificadas && !item.referenciasVerificadas) return false;
      if (flags.recomendadoCare && !item.recomendadoCare) return false;
      if (flags.datosActualizados && !item.datosActualizados) return false;
      return true;
    });
  }, [caregivers, zona, localidad, minCalificacion, selectedModalities, selectedAvailability, selectedTasks, flags]);

  const toggleInArray = (value: string, selected: string[], setter: (next: string[]) => void, checked: boolean) => {
    setter(checked ? [...selected, value] : selected.filter((item) => item !== value));
  };

  return (
    <section className="space-y-4 pb-8">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Busqueda de Cuidadores</h1>
            <p className="mt-2 text-slate-700">Filtra por cobertura, modalidad, disponibilidad, experiencia y calidad de perfil.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button href="/cuidadores/admin-actualizacion" variant="secondary">
              Admin actualizacion
            </Button>
            <Button href="/cuidadores/recomendar" variant="secondary">
              Recomendar cuidador
            </Button>
            <Button href="/cuidadores/alta" variant="secondary">
              Alta de cuidador
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Filtros</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Input label="Zona de cobertura" value={zona} onChange={(e) => setZona(e.target.value)} />
          <Input label="Localidad/barrio" value={localidad} onChange={(e) => setLocalidad(e.target.value)} />
          <Input
            label="Calificacion minima"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={minCalificacion}
            onChange={(e) => setMinCalificacion(e.target.value)}
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">Modalidad</p>
            <div className="space-y-2">
              {modalityFilters.map((option) => (
                <CheckboxField
                  key={option}
                  id={`mod-${option}`}
                  label={option}
                  checked={selectedModalities.includes(option)}
                  onChange={(checked) => toggleInArray(option, selectedModalities, setSelectedModalities, checked)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">Disponibilidad especial</p>
            <div className="space-y-2">
              {availabilityFilters.map((option) => (
                <CheckboxField
                  key={option}
                  id={`dis-${option}`}
                  label={option}
                  checked={selectedAvailability.includes(option)}
                  onChange={(checked) => toggleInArray(option, selectedAvailability, setSelectedAvailability, checked)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">Tareas / experiencia</p>
            <div className="space-y-2">
              {taskFilters.map((option) => (
                <CheckboxField
                  key={option}
                  id={`task-${option}`}
                  label={option}
                  checked={selectedTasks.includes(option)}
                  onChange={(checked) => toggleInArray(option, selectedTasks, setSelectedTasks, checked)}
                />
              ))}
              <CheckboxField
                id="f-ref-c"
                label="Referencias cargadas"
                checked={flags.referenciasCargadas}
                onChange={(v) => setFlags((p) => ({ ...p, referenciasCargadas: v }))}
              />
              <CheckboxField
                id="f-ref-v"
                label="Referencias verificadas"
                checked={flags.referenciasVerificadas}
                onChange={(v) => setFlags((p) => ({ ...p, referenciasVerificadas: v }))}
              />
              <CheckboxField id="f-care" label="Recomendado CARE" checked={flags.recomendadoCare} onChange={(v) => setFlags((p) => ({ ...p, recomendadoCare: v }))} />
              <CheckboxField id="f-upd" label="Datos actualizados" checked={flags.datosActualizados} onChange={(v) => setFlags((p) => ({ ...p, datosActualizados: v }))} />
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-care-100 text-lg font-bold text-care-800">
                {item.foto}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{item.nombre}</h3>
                <p className="text-sm text-slate-600">
                  {item.localidad} - {item.zonasTrabajo.join(", ")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">Calificacion: {item.calificacion.toFixed(1)}</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-700">
              <strong>Modalidad:</strong> {item.modalidades.join(", ")}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <strong>Disponibilidad:</strong> {item.disponibilidadEspecial.join(", ")}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {item.perfilCompleto ? <Badge tone="success">Perfil completo</Badge> : <Badge tone="warning">Perfil incompleto</Badge>}
              {item.referenciasCargadas ? <Badge tone="info">Referencias cargadas</Badge> : null}
              {item.referenciasVerificadas ? <Badge tone="success">Referencias verificadas</Badge> : null}
              {item.recomendadoCare ? <Badge tone="success">Recomendado CARE</Badge> : null}
              {item.datosActualizados ? <Badge tone="info">Datos actualizados</Badge> : null}
              {item.estadoActualizacionPerfil === "pendiente-actualizacion" ? <Badge tone="warning">Pendiente de actualizacion</Badge> : null}
              {item.estadoActualizacionPerfil === "datos-vencidos" ? <Badge tone="danger">Datos vencidos</Badge> : null}
              {item.estadoActualizacionPerfil === "perfil-pausado" ? <Badge tone="danger">Perfil pausado</Badge> : null}
              {item.altaDisponibilidad ? <Badge tone="warning">Alta disponibilidad</Badge> : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button href={`/cuidadores/${item.id}`} variant="secondary">
                Ver perfil
              </Button>
              <Button href={`/cuidadores/${item.id}`}>Contactar</Button>
            </div>
          </Card>
        ))}
      </section>
      {filtered.length === 0 ? <Card className="p-6 text-sm text-slate-600">No hay cuidadores con esos filtros.</Card> : null}
    </section>
  );
}
