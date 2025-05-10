import { InfoIcon } from "lucide-react";

export function SmtpMessage() {
  return (
    <div className="bg-muted/50 px-5 py-3 border rounded-md flex gap-4">
      <InfoIcon size={16} className="mt-0.5" />
      <div className="flex flex-col gap-1">
        <small className="text-sm text-foreground">
          <strong> Nota:</strong> Recibiras un correo electronico con un link
          para continuar.
        </small>
      </div>
    </div>
  );
}
