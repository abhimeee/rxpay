import { RxPayLogo } from "./RxPayLogo";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="border-b border-slate-200 bg-white px-8 py-5">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
