"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
};

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="app-soft-panel transition-all hover:bg-muted/80">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-xl bg-primary/10 p-3 ${color}`}>
          <Icon className="size-6" />
        </div>
        <div>
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
