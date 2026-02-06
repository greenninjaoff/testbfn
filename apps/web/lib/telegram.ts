export type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: any;
  ready?: () => void;
  expand?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  HapticFeedback?: { impactOccurred?: (style: "light"|"medium"|"heavy") => void };
  MainButton?: { setText?: (t: string) => void; show?: () => void; hide?: () => void; onClick?: (cb: () => void) => void; offClick?: (cb: () => void) => void; enable?: () => void; disable?: () => void };
};

export function getTg(): TelegramWebApp | null {
  // @ts-ignore
  return typeof window !== "undefined" ? (window.Telegram?.WebApp ?? null) : null;
}
