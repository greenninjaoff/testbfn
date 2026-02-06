import jwt, { type SignOptions } from "jsonwebtoken";

// ...

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

function parseExpiresToSeconds(v: string | undefined): number {
  // default 7 days
  if (!v) return 7 * 24 * 60 * 60;

  // allow plain seconds: "3600"
  if (/^\d+$/.test(v)) return parseInt(v, 10);

  // allow "7d", "12h", "30m", "45s"
  const m = v.match(/^(\d+)([smhd])$/i);
  if (!m) return 7 * 24 * 60 * 60;

  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();

  switch (unit) {
    case "s": return n;
    case "m": return n * 60;
    case "h": return n * 60 * 60;
    case "d": return n * 24 * 60 * 60;
    default:  return 7 * 24 * 60 * 60;
  }
}

// when you create token:
const expiresInSeconds = parseExpiresToSeconds(process.env.JWT_EXPIRES_IN);

const token = jwt.sign(
  { /* your payload */ },
  JWT_SECRET,
  { expiresIn: expiresInSeconds } as SignOptions
);
