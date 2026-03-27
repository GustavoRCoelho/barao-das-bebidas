"use client";

import { Label } from "@/components/ui/label";

type FormGroupProps = {
  label: string;
  id: string;
  children: React.ReactNode;
};

export function FormGroup({ label, id, children }: FormGroupProps) {
  const labelTrimmed = label.trim();
  const isRequired = labelTrimmed.endsWith("*");
  const labelSemAst = isRequired ? labelTrimmed.slice(0, -1).trimEnd() : labelTrimmed;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="ml-1 text-xs font-semibold text-muted-foreground">
        {labelSemAst}
        {isRequired ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}
