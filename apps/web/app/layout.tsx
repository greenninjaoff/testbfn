import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Protein Store (Telegram Mini App)",
  description: "Telegram Mini App e-commerce store for supplements"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="mx-auto max-w-md min-h-dvh">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
