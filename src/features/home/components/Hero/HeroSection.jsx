import SearchForm from './SearchForm'
import ActionButtons from './ActionButtons'
import TrustBadges from './TrustBadges'
import PetShowcase from './PetShowcase'

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-stone-50">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://www.petz.com.br/blog/wp-content/uploads/2020/05/adocao-de-gatos-felinos.jpg")',
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-50 via-stone-50/95 to-stone-50/20" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex flex-col items-start gap-7 pb-16 pt-36 sm:pt-44">

          <h1 className="max-w-xl font-serif text-4xl font-black leading-[1.1] tracking-tight text-emerald-950 sm:text-5xl lg:text-[3.4rem]">
            Encontre seu novo <span className="text-emerald-500">AU</span><span className="text-amber-500">migo</span>!
          </h1>

          <p className="max-w-md text-lg text-slate-600">
            O AUMatch analisa seu perfil para encontrar os animais mais compatíveis com você.
          </p>

          <SearchForm />
          <ActionButtons />
          <TrustBadges />
        </div>

        <PetShowcase />
      </div>
    </section>
  )
}

export default HeroSection