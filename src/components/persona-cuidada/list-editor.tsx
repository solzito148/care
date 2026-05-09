import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ListEditorProps = {
  title: string;
  children: ReactNode;
  addLabel?: string;
};

export function ListEditor({ title, children, addLabel = "Agregar item" }: ListEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <Button type="button" variant="secondary" size="md">
          {addLabel}
        </Button>
      </div>
      <Card className="space-y-3 border-dashed bg-slate-50 p-4">{children}</Card>
    </div>
  );
}
