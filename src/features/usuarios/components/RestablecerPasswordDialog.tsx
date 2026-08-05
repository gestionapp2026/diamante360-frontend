import { useState } from "react";
import { Check, Copy, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRestablecerPasswordUsuario } from "@/features/usuarios/hooks/use-usuarios";
import type { UsuarioResponse } from "@/types/auth";

interface RestablecerPasswordDialogProps {
  usuario: UsuarioResponse;
  disabled?: boolean;
}

export function RestablecerPasswordDialog({ usuario, disabled }: RestablecerPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [passwordTemporal, setPasswordTemporal] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const restablecerPassword = useRestablecerPasswordUsuario(usuario.id);

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPasswordTemporal(null);
      setCopiado(false);
    }
  }

  async function onConfirmar() {
    try {
      const resultado = await restablecerPassword.mutateAsync();
      setPasswordTemporal(resultado.passwordTemporal);
    } catch {
      // el error ya se notifica via toast en el hook
    }
  }

  async function copiarPassword() {
    if (!passwordTemporal) return;
    try {
      await navigator.clipboard.writeText(passwordTemporal);
      setCopiado(true);
      toast.success("Contrasena temporal copiada");
    } catch {
      toast.error("No se pudo copiar la contrasena");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button
        variant="outline"
        size="icon"
        disabled={disabled}
        title={disabled ? "No puedes restablecer tu propia contrasena por esta via" : "Restablecer contrasena"}
        onClick={() => setOpen(true)}
      >
        <KeyRound className="size-4" />
      </Button>
      <DialogContent className="sm:max-w-md">
        {passwordTemporal ? (
          <>
            <DialogHeader>
              <DialogTitle>Contrasena temporal generada</DialogTitle>
              <DialogDescription>
                Comparte esta contrasena con <span className="font-medium text-foreground">{usuario.username}</span>{" "}
                de forma segura. Debera cambiarla en su proximo inicio de sesion.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Input readOnly value={passwordTemporal} className="font-mono" />
              <Button type="button" variant="outline" size="icon" onClick={copiarPassword}>
                {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Restablecer contrasena</DialogTitle>
              <DialogDescription>
                Se generara una contrasena temporal para{" "}
                <span className="font-medium text-foreground">{usuario.username}</span>. El usuario debera
                definir una nueva contrasena al iniciar sesion.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={onConfirmar} disabled={restablecerPassword.isPending}>
                {restablecerPassword.isPending && <Loader2 className="size-4 animate-spin" />}
                Restablecer contrasena
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
