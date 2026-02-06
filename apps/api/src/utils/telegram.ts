import crypto from "crypto";

/**
 * Validates Telegram WebApp initData according to official docs.
 * Returns parsed data if valid, else null.
 */
export function validateTelegramInitData(initData: string, botToken: string): Record<string, any> | null {
  // initData like: "query_id=...&user=%7B...%7D&auth_date=...&hash=..."
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  // data_check_string is sorted by key
  const pairs: string[] = [];
  Array.from(params.keys()).sort().forEach((key) => {
    const v = params.get(key);
    if (v !== null) pairs.push(`${key}=${v}`);
  });
  const dataCheckString = pairs.join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (computedHash !== hash) return null;

  const out: Record<string, any> = {};
  params.forEach((value, key) => {
    out[key] = value;
  });

  // parse user JSON if present
  if (out.user) {
    try { out.user = JSON.parse(out.user); } catch {}
  }
  return out;
}
