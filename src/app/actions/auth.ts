"use server";

import {
  clearOrganizerSessionCookie,
  isOrganizerAuthenticated,
  setOrganizerSessionCookie,
  verifyOrganizerPassword,
} from "@/lib/auth";

export async function loginOrganizerAction(password: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!password || !password.trim()) {
    return { success: false, error: "Zadejte heslo organizátora" };
  }

  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!adminPassword) {
    console.error(
      "[Auth Error] ADMIN_PASSWORD environment variable is not configured.",
    );
    return {
      success: false,
      error:
        "Na serveru není nakonfigurováno heslo organizátora (ADMIN_PASSWORD).",
    };
  }

  const authSecret = process.env.AUTH_SECRET?.trim();
  if (!authSecret || authSecret.length < 32) {
    console.error(
      "[Auth Error] AUTH_SECRET environment variable is missing or under 32 characters.",
    );
    return {
      success: false,
      error:
        "Na serveru není správně nastaven klíč pro podepisování relací (AUTH_SECRET).",
    };
  }

  const isValid = verifyOrganizerPassword(password);
  if (!isValid) {
    return {
      success: false,
      error: "Nesprávné heslo pro odbavení. Zkontrolujte heslo organizátora.",
    };
  }

  await setOrganizerSessionCookie();
  return { success: true };
}

export async function logoutOrganizerAction(): Promise<{ success: boolean }> {
  await clearOrganizerSessionCookie();
  return { success: true };
}

export async function checkOrganizerAuthAction(): Promise<{
  authenticated: boolean;
}> {
  const authenticated = await isOrganizerAuthenticated();
  return { authenticated };
}
