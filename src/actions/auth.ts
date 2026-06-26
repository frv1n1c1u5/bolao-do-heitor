"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authenticateUser, logout } from "@/lib/auth";

function loginSystemError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("DATABASE_URL")) {
    return "Banco de dados nao configurado. Crie o .env.local com DATABASE_URL e rode as migrations.";
  }

  return "Nao foi possivel entrar agora. Verifique a configuracao do banco e tente novamente.";
}

export async function loginPlayerAction(_: unknown, formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (!identifier || !/^\d{4}$/.test(pin)) {
    return { error: "Informe acesso e PIN de 4 digitos." };
  }

  try {
    const result = await authenticateUser(identifier, pin);
    if (!result.ok) {
      return { error: result.error };
    }
  } catch (error) {
    return { error: loginSystemError(error) };
  }

  revalidatePath("/app");
  redirect("/app");
}

export async function loginAdminAction(_: unknown, formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (!identifier || !/^\d{4}$/.test(pin)) {
    return { error: "Informe acesso e PIN de 4 digitos." };
  }

  try {
    const result = await authenticateUser(identifier, pin, UserRole.ADMIN);
    if (!result.ok) {
      return { error: result.error };
    }
  } catch (error) {
    return { error: loginSystemError(error) };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/entrar");
}
