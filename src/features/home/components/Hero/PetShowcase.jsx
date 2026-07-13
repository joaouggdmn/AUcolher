import MatchBalloons from './MatchBalloons'
import petImage from '../../../../assets/hero-pet.png'


function PetShowcase() {
  return (
    <>
      {/* Mobile/tablet: versão compacta */}
      <div className="relative flex h-80 w-full items-center justify-center sm:h-96 lg:hidden">
        <div className="absolute h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-600 to-amber-400 opacity-90 blur-md sm:h-72 sm:w-72" />

        <img
          src={petImage}
          alt="Pet disponível para adoção"
          className="relative z-10 h-64 w-64 object-contain drop-shadow-2xl sm:h-80 sm:w-80"
        />

        <MatchBalloons variant="mobile" />
      </div>

      {/* Desktop: a experiência completa em camadas */}
      <div className="relative hidden h-[600px] w-full items-center justify-center lg:flex">
        {/* Glow atmosférico */}
        <div className="absolute h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-emerald-500/40 via-amber-300/30 to-transparent blur-3xl" />

        {/* Blob orgânico */}
        <div
          className="absolute h-[440px] w-[440px] rotate-6 bg-gradient-to-br from-emerald-500 via-emerald-700 to-emerald-900 shadow-2xl shadow-emerald-950/30"
          style={{ borderRadius: '62% 38% 55% 45% / 55% 45% 55% 45%' }}
        />

        {/* Anel decorativo */}
        <div className="absolute h-[500px] w-[500px] -rotate-12 rounded-full border-2 border-dashed border-amber-400/50" />

        {/* Sombra de contato */}
        <div className="absolute bottom-16 h-8 w-64 rounded-full bg-emerald-950/30 blur-xl" />

        {/* A estrela — pet com fundo transparente */}
        <img
          // 🔴 Troque `src` pelo import do seu PNG (fundo transparente)
          src={petImage}
          alt="Pet disponível para adoção"
          className="relative z-20 h-[600px] w-[600px] object-contain drop-shadow-[0_35px_35px_rgba(6,78,59,0.35)]"
        />

        <MatchBalloons variant="desktop" />
      </div>
    </>
  )
}

export default PetShowcase