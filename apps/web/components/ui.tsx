import Link from "next/link";

export function TopBar({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-10 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-white/80">{right}</div>
      </div>
    </div>
  );
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"ghost" }) {
  const { variant="primary", className="", ...rest } = props;
  const base = "px-4 py-2 rounded-xl text-sm font-medium transition active:scale-[0.99]";
  const styles = variant === "primary"
    ? "bg-[var(--accent)] text-black hover:opacity-90"
    : "bg-white/5 hover:bg-white/10 border border-white/10";
  return <button className={`${base} ${styles} ${className}`} {...rest} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/30 ${props.className||""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/30 ${props.className||""}`} />;
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-[var(--card)] border border-white/10 shadow-sm">{children}</div>;
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}

export function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80">{children}</span>;
}

export function NavBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-md border-t border-white/10 bg-black/60 backdrop-blur">
        <div className="grid grid-cols-4 text-xs">
          <NavItem href="/" label="Home" />
          <NavItem href="/catalog" label="Catalog" />
          <NavItem href="/cart" label="Cart" />
          <NavItem href="/profile" label="Profile" />
        </div>
      </div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="py-3 text-center text-white/80 hover:text-white">
      {label}
    </Link>
  );
}
