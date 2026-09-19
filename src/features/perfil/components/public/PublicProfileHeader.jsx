import {
  FaLocationDot,
  FaCalendarCheck,
  FaCalendarDays,
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
  FaPaw,
  FaHandHoldingHeart,
  FaStar,
  FaCircleCheck,
} from 'react-icons/fa6'
import VerifiedBadge from '../../../ong/components/VerifiedBadge'

const SOCIAL_NETWORKS = [
  { key: 'instagram', label: 'Instagram', icon: FaInstagram },
  { key: 'facebook', label: 'Facebook', icon: FaFacebookF },
  { key: 'x', label: 'X', icon: FaXTwitter },
]

function formatMonthYear(isoDate) {
  return new Date(isoDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`
}

function StatTile({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/70 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="font-serif text-xl font-black leading-tight text-emerald-950">{value}</p>
        <p className="truncate text-xs font-semibold text-emerald-700">{label}</p>
      </div>
    </div>
  )
}

function TrustSeal({ icon: Icon, tone = 'emerald', children }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-800',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    slate: 'bg-slate-100 text-slate-500',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${tones[tone]}`}>
      <Icon size={12} />
      {children}
    </span>
  )
}

function PublicProfileHeader({ profile, stats }) {
  const isOng = profile.userType === 'ONG'
  const isVerifiedOng = isOng && profile.isVerified
  const initial = profile.name?.charAt(0)?.toUpperCase() ?? '?'
  const socialLinks = SOCIAL_NETWORKS.filter((network) => profile.socialLinks?.[network.key])
  const { average, count: reviewCount } = stats.rating
  const ratingLabel = reviewCount > 0 ? average.toFixed(1).replace('.', ',') : '—'

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 sm:h-48">
        {profile.coverUrl && (
          <img src={profile.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-500/20 blur-[100px]" />
      </div>

      <div className="px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="flex items-end justify-between gap-4">
          <div className="relative -mt-14 shrink-0 sm:-mt-16">
            <span
              className={`flex h-28 w-28 items-center justify-center overflow-hidden bg-emerald-700 font-serif text-4xl font-black text-white shadow-xl shadow-emerald-950/20 ring-4 ring-white sm:h-32 sm:w-32 ${
                isOng ? 'rounded-3xl' : 'rounded-full'
              }`}
            >
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </span>
            {isVerifiedOng && (
              <span
                title="Instituição verificada"
                className="absolute -bottom-1.5 -right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-emerald-950 shadow-md ring-4 ring-white"
              >
                <FaCircleCheck size={15} />
              </span>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="flex gap-2 pt-4">
              {socialLinks.map(({ key, label, icon: Icon }) => (
                <a
                  key={key}
                  href={profile.socialLinks[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} de ${profile.name}`}
                  title={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {isOng ? 'Instituição' : 'Pessoa física'}
            </span>
            {isVerifiedOng && <VerifiedBadge />}
          </div>

          <h1 className="break-words font-serif text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
            {profile.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            {profile.city && (
              <span className="flex items-center gap-1.5">
                <FaLocationDot size={12} className="text-emerald-600" />
                {profile.city}, {profile.state}
              </span>
            )}
            {profile.memberSince && (
              <span className="flex items-center gap-1.5">
                <FaCalendarCheck size={12} className="text-emerald-600" />
                Na AUcolher desde {formatMonthYear(profile.memberSince)}
              </span>
            )}
          </div>

          {/* Pessoa física: a bio fica aqui mesmo (perfil enxuto). ONG: a bio
              completa vai para o bloco "Sobre a instituição" */}
          {!isOng && (
            <p className="mt-1 max-w-2xl break-words leading-relaxed text-slate-600">
              {profile.bio || 'Esta pessoa ainda não escreveu uma bio.'}
            </p>
          )}
        </div>

        {isOng ? (
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile icon={FaHandHoldingHeart} value={stats.adoptionsCount} label="Adoções realizadas" />
            <StatTile icon={FaPaw} value={stats.availableAnimalsCount} label="Animais disponíveis" />
            <StatTile icon={FaStar} value={ratingLabel} label={pluralize(reviewCount, 'avaliação', 'avaliações')} />
            <StatTile icon={FaCalendarDays} value={profile.foundedYear ?? '—'} label="Ano de fundação" />
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            {reviewCount > 0 ? (
              <TrustSeal icon={FaStar} tone="amber">
                {ratingLabel} · {pluralize(reviewCount, 'avaliação', 'avaliações')}
              </TrustSeal>
            ) : (
              <TrustSeal icon={FaStar} tone="slate">
                Ainda sem avaliações
              </TrustSeal>
            )}
            {stats.adoptionsCount > 0 && (
              <TrustSeal icon={FaHandHoldingHeart}>
                {pluralize(stats.adoptionsCount, 'adoção concluída', 'adoções concluídas')}
              </TrustSeal>
            )}
            {stats.availableAnimalsCount > 0 && (
              <TrustSeal icon={FaPaw}>
                {pluralize(stats.availableAnimalsCount, 'animal para adoção', 'animais para adoção')}
              </TrustSeal>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default PublicProfileHeader
