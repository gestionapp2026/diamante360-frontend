import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "warning" | "destructive" | "success";
}

const TONE_ICON_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-success/15 text-success",
};

export function StatCard({ label, value, icon: Icon, hint, tone = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 pt-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", TONE_ICON_CLASSES[tone])}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
