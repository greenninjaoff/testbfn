import Link from "next/link";
import { TopBar, Card, CardBody, Chip, NavBar } from "../components/ui";

export default function Home() {
  return (
    <div className="pb-20">
      <TopBar title="IronCore Store" right={<Link href="/admin" className="text-white/70">Admin</Link>} />
      <div className="p-4 space-y-4">
        <Card>
          <CardBody>
            <div className="text-lg font-semibold">Supplements that hit.</div>
            <div className="text-sm text-white/70 mt-1">
              Proteins, creatine, vitamins, pre-workout, bars — all inside Telegram.
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Chip>Fast checkout</Chip>
              <Chip>Stock aware</Chip>
              <Chip>Mobile-first</Chip>
            </div>
            <div className="mt-4">
              <Link href="/catalog" className="inline-flex px-4 py-2 rounded-xl bg-[var(--accent)] text-black text-sm font-medium">
                Browse catalog
              </Link>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {[
            ["protein","Protein"],
            ["creatine","Creatine"],
            ["vitamins","Vitamins"],
            ["pre-workout","Pre-workout"],
            ["bars","Bars"],
            ["other","Other"]
          ].map(([key,label]) => (
            <Link key={key} href={`/catalog?category=${key}`} className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10">
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-xs text-white/60 mt-1">View</div>
            </Link>
          ))}
        </div>
      </div>
      <NavBar />
    </div>
  );
}
