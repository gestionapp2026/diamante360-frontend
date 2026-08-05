import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authApi } from "@/features/auth/api/auth-api";
import { cambiarPasswordSchema, type CambiarPasswordFormValues } from "@/features/auth/schemas/auth-schemas";
import { useAuthStore } from "@/stores/auth-store";
import { getErrorMessage } from "@/lib/api-client";

export function CambiarPasswordPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const updateUsuario = useAuthStore((s) => s.updateUsuario);

  const form = useForm<CambiarPasswordFormValues>({
    resolver: zodResolver(cambiarPasswordSchema),
    defaultValues: { passwordActual: "", passwordNueva: "", confirmarPassword: "" },
  });

  async function onSubmit(values: CambiarPasswordFormValues) {
    setLoading(true);
    try {
      await authApi.cambiarMiPassword({
        passwordActual: values.passwordActual,
        passwordNueva: values.passwordNueva,
      });
      toast.success("Contrasena actualizada correctamente.");
      if (usuario) {
        updateUsuario({ ...usuario, debeCambiarPassword: false });
      }
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo cambiar la contrasena"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <KeyRound className="size-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Cambia tu contrasena</h1>
          <p className="text-sm text-muted-foreground">
            {usuario ? `Hola ${usuario.nombreCompleto}, ` : ""}debes definir una nueva contrasena antes de continuar
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nueva contrasena</CardTitle>
            <CardDescription>Minimo 8 caracteres, con al menos una letra y un numero</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="passwordActual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contrasena actual</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passwordNueva"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva contrasena</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmarPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar nueva contrasena</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Guardar y continuar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
