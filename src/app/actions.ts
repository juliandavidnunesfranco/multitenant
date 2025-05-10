"use server";
import { type User } from "@supabase/supabase-js";
import {
  encodedRedirect,
  generateUUID,
  productos_sin_iva,
} from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Customer, DeliveryStore, Product } from "@/store";
import { DispatchData } from "@/lib/print";
import { Method } from "@/lib/types";
import { signInSchema, validateAsync, validateWithSchema } from "@/conf/schema";

export const getToken = async (): Promise<string> => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    return encodedRedirect("error", "/sign-in", "Token no encontrado");
  }

  return token;
};

export const fetchData = async (
  url: string,
  method: Method,
  token: string,
  body?: any
): Promise<any> => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return encodedRedirect(
      "error",
      "/sign-in",
      `Error en la solicitud, ${error.message}`
    );
  }

  return response.json();
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email y contraseñan son requeridos"
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Gracias por registrarte!, Revisa el correo y verifica el link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const validation = await validateAsync(signInSchema, {
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return encodedRedirect("error", "/sign-in", validation.error);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: validation.data.email as string,
      password: validation.data.password as string,
    });

    if (error) throw error;

    return redirect("/protected");
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return encodedRedirect("error", "/signin", message);
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email es requerido");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "No pudimos actualizar la contraseña"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Revisa tu correo y da clic en el link que te enviamos."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Los campos de contraseña y confirmar contraseña son requeridos"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Las contraseñas no coinciden"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Fallo al actualizar la contraseña"
    );
  }

  encodedRedirect("success", "/protected", "Contraseña actualizada");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  throw redirect("/signin");
};
