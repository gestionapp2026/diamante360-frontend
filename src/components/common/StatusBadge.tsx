import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "destructive" | "muted" | "primary";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
  muted: "bg-muted text-muted-foreground border-transparent",
  primary: "bg-primary/10 text-primary border-primary/30",
};

interface StatusBadgeProps {
  label: string;
  tone: Tone;
  className?: string;
}

export function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(TONE_CLASSES[tone], className)}>
      {label}
    </Badge>
  );
}

export function activoTone(activo: boolean): Tone {
  return activo ? "success" : "muted";
}
