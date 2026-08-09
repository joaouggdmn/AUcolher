import { Link } from 'react-router-dom'
import { FaPaw, FaBuildingShield, FaCircleCheck, FaArrowRight } from 'react-icons/fa6'
import RevealOnScroll from '../../../../core/components/ui/RevealOnScroll'

function ProfileSplitCta() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:py-28">
      <RevealOnScroll className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] shadow-2xl shadow-emerald-950/20">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Bloco 1: Pessoa */}
          <div className="relative flex flex-col items-start gap-5 overflow-hidden bg-emerald-900 p-10 sm:p-14">
            <FaPaw className="pointer-events-none absolute -bottom-8 -right-8 text-[10rem] text-white/5" />

            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
              <FaPaw size={22} />
            </span>

            <h3 className="font-serif text-2xl font-black text-white sm:text-3xl">
              Quer adotar ou divulgar um resgate?
            </h3>
            <p className="max-w-sm text-emerald-100/80">
              Crie sua conta gratuita e comece a usar o AUmatch agora mesmo.
            </p>

            <Link
              to="/cadastro"
              state={{ preselectUserType: 'PESSOA' }}
              className="group relative z-10 mt-2 flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-emerald-900 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              Sou pessoa
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Bloco 2: ONG */}
          <div className="relative flex flex-col items-start gap-5 overflow-hidden bg-gradient-to-br from-amber-400 to-amber-500 p-10 sm:p-14">
            <FaBuildingShield className="pointer-events-none absolute -bottom-8 -right-4 text-[10rem] text-emerald-950/5" />

            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/10 text-emerald-950">
              <FaBuildingShield size={22} />
              <FaCircleCheck size={16} className="absolute -right-1 -top-1 rounded-full bg-white text-emerald-700" />
            </span>

            <h3 className="font-serif text-2xl font-black text-emerald-950 sm:text-3xl">
              Representa uma ONG?
            </h3>
            <p className="max-w-sm text-emerald-950/70">
              Gerencie eventos, campanhas de arrecadação e todo o processo de adoção em um só lugar.
            </p>

            <Link
              to="/cadastro"
              state={{ preselectUserType: 'ONG' }}
              className="group relative z-10 mt-2 flex items-center gap-2 rounded-full bg-emerald-950 px-7 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900"
            >
              Cadastrar instituição
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Selo "ou" na costura — resolve a divisão visual sem depender de clip-path */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm font-black text-emerald-900 shadow-xl lg:flex">
          ou
        </div>
      </RevealOnScroll>
    </section>
  )
}

export default ProfileSplitCta