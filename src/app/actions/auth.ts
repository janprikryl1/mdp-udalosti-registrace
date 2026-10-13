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
