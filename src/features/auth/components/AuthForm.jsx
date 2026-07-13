// src/features/auth/components/AuthForm.jsx
import { Link } from 'react-router-dom'
import { FaPaw } from 'react-icons/fa6'
import PetRegister from '../../../assets/hero-pet.png'

function AuthForm({ heading, subheading, children }) {
  return (
    <div className="flex min-h-screen w-full bg-white">

      {/* ═══ Lado visual — 50%, só aparece no desktop (lg+) ═══ */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 xl:p-16">

        {/* Padrão geométrico sutil: dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Gradiente dourado nos cantos — sutil, atmosférico */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-amber-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-amber-400/10 blur-[100px]" />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center text-2xl font-black tracking-tight">
          <span className="text-white">AU</span>
          <span className="text-amber-400">colher</span>
        </Link>

        {/* Conteúdo institucional */}
        <div className="relative z-10 flex flex-col gap-8">
          <h1 className="max-w-md font-serif text-4xl font-black leading-[1.15] text-white xl:text-5xl">
            {heading}
          </h1>
          <p className="max-w-sm text-lg text-emerald-100/80">{subheading}</p>

          {/* Showcase visual — mesma linguagem do Hero, versão compacta */}
          <div className="relative mt-4 flex h-64 items-center justify-center xl:h-72">
            <div className="absolute h-56 w-56 rotate-6 bg-gradient-to-br from-emerald-400 via-amber-400/40 to-transparent opacity-80 blur-2xl xl:h-64 xl:w-64" />

            <img
              // 🔴 Substitua pelo seu PNG local de pet, se preferir
              src={PetRegister}
              alt="Pet feliz esperando adoção"
              className="relative z-10 h-60 w-60 object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.35)] xl:h-72 xl:w-72"
            />

            <div className="absolute left-0 top-4 z-20 flex items-center gap-2 rounded-2xl bg-amber-400 px-3 py-2 text-xs font-extrabold text-emerald-950 shadow-lg shadow-amber-500/30">
              <FaPaw size={12} />
              +2.400 adoções felizes
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-emerald-200/50">
          © 2026 AUcolher — Feito com carinho para conectar vidas.
        </p>
      </aside>

      {/* ═══ Lado do formulário — 50% desktop, 100% mobile ═══
          Padding generoso e crescente (px-6 → xl:px-24) garante respiro
          real ao redor do card, mesmo em monitores bem largos */}
      <main className="flex w-full flex-1 items-center justify-center bg-stone-50 px-6 py-10 sm:px-10 lg:w-1/2 lg:bg-white lg:px-12 lg:py-16 xl:px-24">
        <div className="w-full max-w-md">
          {/* Logo — só aparece no mobile, já que o lado visual está escondido */}
          <Link
            to="/"
            className="mb-8 flex items-center justify-center text-2xl font-black tracking-tight lg:hidden"
          >
            <span className="text-emerald-950">AU</span>
            <span className="text-amber-500">colher</span>
          </Link>

          {/* Card com glassmorphism sutil no mobile (fundo stone-50);
              vira transparente/plano no desktop (fundo já é branco puro) */}
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-md sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AuthForm