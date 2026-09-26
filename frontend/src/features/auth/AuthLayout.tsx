import type { ReactNode } from "react";
import Logo from "../../components/Logo";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
};

export default function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-full flex-col items-center px-4 py-12 sm:justify-center">
      <Logo className="mb-8" />
      <section className="w-full max-w-[400px] rounded-xl border border-line bg-panel p-6 shadow-[0_1px_2px_rgba(22,32,42,0.04),0_8px_24px_rgba(22,32,42,0.06)] sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </section>
      <p className="mt-6 text-sm text-muted">{footer}</p>
    </main>
  );
}
