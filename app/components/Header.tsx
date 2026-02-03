'use client';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-7 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className=" bg-blue-600 rounded-lg flex items-center justify-center">
        <img src="/assets/images/logo-essentials.gif" alt="Essentials Logo"  className="w-24 h-24
      sm:w-25 sm:h-25
      md:w-28 md:h-28
      lg:w-40 lg:h-40
      absolute top-0 left-8 sm:left-35 z-50" suppressHydrationWarning/>
        </div>
       
      </div>
    </header>
  );
}