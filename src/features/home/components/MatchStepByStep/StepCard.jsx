function StepCard({ number, icon: Icon, title, description }) {
  return (
    <div className="relative flex flex-col items-center gap-5 text-center">
      {/* Círculo do ícone — z-10 garante que fique acima da linha conectora */}
      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md shadow-emerald-950/10 ring-8 ring-stone-50">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
          <Icon size={26} />
        </div>

        {/* Número do passo — badge dourado sobreposto */}
        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-emerald-950 shadow-md shadow-amber-500/30 ring-4 ring-white">
          {number}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-emerald-950">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  )
}

export default StepCard