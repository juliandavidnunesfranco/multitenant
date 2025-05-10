import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <div className="w-full h-screen flex">
        <div className="hidden md:flex w-1/2 bg-background_forgot_password bg-cover bg-center"></div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-4">
          <form className="w-full max-w-sm flex flex-col gap-4 p-8 bg-slate-50/5 shadow-md rounded-lg">
            <div>
              <h1 className="text-2xl font-medium">Recuperar Contraseña</h1>
              <p className="text-sm text-foreground">
                Ya tienes una cuenta?{" "}
                <Link className="text-primary underline" href="/sign-in">
                  Entrar
                </Link>
              </p>
            </div>
            <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
              <Label htmlFor="email">Email</Label>
              <Input name="email" placeholder="tucorreo@example.com" required />
              <SubmitButton formAction={forgotPasswordAction}>
                Recuperar Contraseña
              </SubmitButton>
              <FormMessage message={searchParams} />
            </div>
            <div className={"mt-2"}>
              <SmtpMessage />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
