"use server";

import { redirect } from "next/navigation";
import { logout } from "@/lib/session";

/**
 * Server Action importabile direttamente da Client Component (es. UserMenu,
 * che è "use client" per via del dropdown). Wrappa logout() + redirect così
 * la UI non deve gestire cookie/sessione, solo invocare l'azione via <form>.
 */
export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/login");
}
