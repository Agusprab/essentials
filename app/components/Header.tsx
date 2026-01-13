'use client';
export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-7 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className=" bg-blue-600 rounded-lg flex items-center justify-center">
        <img src="/assets/images/logo-essentials.gif" alt="AI Essentials Logo"  className="w-24 h-24
      sm:w-25 sm:h-25
      md:w-28 md:h-28
      lg:w-40 lg:h-40
      absolute top-0 left-8 sm:left-35 z-50"/>
        </div>
       
      </div>
      <div className="flex items-center gap-2">
        <div className={`px-3 py-1 ${process.env.NEXT_PUBLIC_STATUS_APP === 'OFFLINE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} text-xs font-bold rounded-full uppercase tracking-wider`}>
          {process.env.NEXT_PUBLIC_STATUS_APP}
        </div>
      </div>
    </header>
  );
}