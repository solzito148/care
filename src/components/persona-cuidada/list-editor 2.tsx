import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ListEditorProps = {
  title: string;
  children: ReactNode;
  addLabel?: string;
  onAdd?: () => void;
  emptyLabel?: string;
};

export function ListEditor({ title, children, addLabel = "Agregar item", onAdd, emptyLabel }: ListEditorProps) {
  const isEmpty =
    children == null ||
    (Array.isArray(children) && children.length === 0) ||
    (typeof children === "boolean") ||
    (typeof children === "string" && children.length === 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <Button type="button" variant="secondary" size="md" onClick={onAdd} disabled={!onAdd}>
          {addLabel}
        </Button>
      </div>
      <Card className="space-y-3 border-dashed bg-slate-50 p-4">
        {isEmpty && emptyLabel ? (
          <p className="text-sm text-slate-600">{emptyLabel}</p>
        ) : (
          children
        )}
      </Card>
    </div>
  );
}
