"use client";

import { useEffect, useState } from "react";
import { getTg } from "./telegram";
import { api } from "./api";

export type SessionUser = { id: string; telegramId: string; username?: string | null; firstName?: string | null; role: "USER" | "ADMIN" };

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setLoading(true);
      try {
        const token = localStorage.getItem("tma_token");
        const cached = localStorage.getItem("tma_user");
        if (cached) setUser(JSON.parse(cached));

        // If no token, try Telegram auth
        if (!token) {
          const tg = getTg();
          const initData = tg?.initData || "";
          if (initData) {
            const res = await api<{ token: string; user: SessionUser }>("/auth/telegram", {
              method: "POST",
              body: JSON.stringify({ initData })
            });
            localStorage.setItem("tma_token", res.token);
            localStorage.setItem("tma_user", JSON.stringify(res.user));
            setUser(res.user);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, []);

  function logout() {
    localStorage.removeItem("tma_token");
    localStorage.removeItem("tma_user");
    setUser(null);
  }

  return { user, loading, logout };
}
