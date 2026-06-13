"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteAccountAction } from "@/actions/cuenta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CONFIRM_WORD = "ELIMINAR";

const dangerButton =
  "inline-flex min-h-11 items-center justify-center rounded-xl2 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60";

export function DeleteAccountCard() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDelete = async () => {
    setLoading(true);
    setError("");
    const result = await deleteAccountAction();
    if (!result.ok) {
      setError(result.error ?? "No se pudo eliminar la cuenta.");
      setLoading(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  };

  return (
    <Card className="border-red-200 p-6">
      <h2 className="text-xl font-semibold text-red-700">Eliminar cuenta</h2>
      <p className="mt-2 text-sm text-slate-700">
        Esta accion borra tu cuenta y los datos de los hogares que administras de
        forma permanente. No se puede deshacer.
      </p>

      {!confirming ? (
        <div className="mt-4">
          <button type="button" className={dangerButton} onClick={() => setConfirming(true)}>
            Quiero eliminar mi cuenta
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Escribi <span className="font-bold">{CONFIRM_WORD}</span> para confirmar.
            <input
              type="text"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              autoComplete="off"
            />
          </label>
          {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={dangerButton}
              disabled={confirmText !== CONFIRM_WORD || loading}
              onClick={onDelete}
            >
              {loading ? "Eliminando..." : "Eliminar definitivamente"}
            </button>
            <Button
              variant="ghost"
              disabled={loading}
              onClick={() => {
                setConfirming(false);
                setConfirmText("");
                setError("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
