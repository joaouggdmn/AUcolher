import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarDays, FaHandHoldingHeart, FaLocationDot } from 'react-icons/fa6'
import DonationModal from '../../../doacoes/components/DonationModal'
import SectionHeader from '../shared/SectionHeader'
import HomeReveal from '../shared/HomeReveal'
import NgoShield from '../shared/NgoShield'
import PetPhoto from '../shared/PetPhoto'
import OngAvatar from './OngAvatar'
import OngSelector from './OngSelector'
import OngCampaignRow from './OngCampaignRow'
import OngEventItem from './OngEventItem'
import { useOngShowcase } from '../../hooks/useOngShowcase'
import { plural } from '../../utils/homePets'

const PANEL_ID = 'ong-showcase-panel'
const MAX_ITEMS = 2

const TEXT_LINK =
  'group inline-flex items-center gap-1.5 rounded-full text-sm font-bold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2'

function ArrowLink({ to, state, children, className = '' }) {
  return (
    <Link to={to} state={state} className={`${TEXT_LINK} ${className}`}>
      {children}
      <FaArrowRight
        aria-hidden="true"
        size={11}
        className="transition-transform duration-300 group-hover:translate-x-0.5"
      />
    </Link>
  )
}

function BlockHeader({ icon: Icon, title, to, linkLabel }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-base font-extrabold tracking-tight text-emerald-950">
        <Icon aria-hidden="true" size={15} className="text-emerald-700" />
        {title}
      </h3>
      <ArrowLink to={to}>{linkLabel}</ArrowLink>
    </div>
  )
}

function EmptyBlock({ children }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">
      {children}
    </p>
  )
}

function OngCard({ ong }) {
  const { profile } = ong
  const stats = [
    { label: plural(ong.petCount, 'pet', 'pets'), value: ong.petCount },
    { label: plural(ong.campaigns.length, 'campanha', 'campanhas'), value: ong.campaigns.length },
    { label: plural(ong.upcomingEvents.length, 'evento', 'eventos'), value: ong.upcomingEvents.length },
  ]

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm shadow-emerald-950/5 ring-1 ring-slate-200/70">
      <div className="relative h-28 bg-gradient-to-br from-emerald-700 to-emerald-900">
        {profile?.coverUrl && <PetPhoto src={profile.coverUrl} width={800} className="h-full w-full" />}
      </div>

      <div className="px-5 pb-5">
        <OngAvatar ong={ong} size="lg" className="-mt-8" />

        <p className="mt-3 flex items-center gap-2 text-xl font-black tracking-tight text-emerald-950">
          {ong.name}
          <NgoShield size="sm" />
        </p>
        {profile?.city && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <FaLocationDot aria-hidden="true" size={11} className="text-emerald-600" />
            {profile.city}, {profile.state}
          </p>
        )}

        <dl className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-stone-50 py-3 text-center">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="text-xl font-black tabular-nums text-emerald-950">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {profile && <ArrowLink to={`/ong/${profile.id}`}>Ver perfil</ArrowLink>}
          {ong.petCount > 0 && <ArrowLink to="/animais">Ver pets para adoção</ArrowLink>}
        </div>
      </div>
    </div>
  )
}

// Escolha uma ONG e veja o que ela está fazendo agora: campanhas abertas
// (com o mesmo "Doar" via PIX da página de campanhas) e eventos futuros
function OngShowcaseSection({ persona }) {
  const ongs = useOngShowcase()
  const [selectedName, setSelectedName] = useState(null)
  const [donatingTo, setDonatingTo] = useState(null)
  const closeDonation = useCallback(() => setDonatingTo(null), [])

  if (ongs.length === 0) return null

  // Primeira ONG (a mais ativa) até a pessoa escolher outra
  const selected = ongs.find((ong) => ong.name === selectedName) ?? ongs[0]
  const campaigns = selected.campaigns.slice(0, MAX_ITEMS)
  const events = selected.upcomingEvents.slice(0, MAX_ITEMS)

  return (
    <section aria-labelledby="ongs-title" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <HomeReveal>
          <SectionHeader
            id="ongs-title"
            eyebrow="ONGs parceiras"
            title="Veja como cada ONG está ajudando."
            subtitle="Escolha uma ONG para ver as campanhas e os próximos eventos dela."
          />
        </HomeReveal>

        <HomeReveal className="mt-10">
          <OngSelector
            ongs={ongs}
            selectedName={selected.name}
            onSelect={setSelectedName}
            panelId={PANEL_ID}
          />

          <div
            key={selected.name}
            id={PANEL_ID}
            role="tabpanel"
            aria-label={selected.name}
            className="mt-6 grid gap-6 rounded-[2rem] bg-stone-50 p-4 ring-1 ring-slate-200/60 motion-safe:animate-[fade-slide-in_0.25s_ease-out_both] sm:p-6 lg:grid-cols-12 lg:gap-8 lg:p-8"
          >
            <div className="lg:col-span-5">
              <OngCard ong={selected} />
            </div>

            <div className="flex flex-col gap-8 lg:col-span-7">
              <div className="flex flex-col gap-3">
                <BlockHeader icon={FaHandHoldingHeart} title="Campanhas" to="/campanhas" linkLabel="Ver todas" />
                {campaigns.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {campaigns.map((campaign) => (
                      <OngCampaignRow key={campaign.id} campaign={campaign} onDonate={setDonatingTo} />
                    ))}
                  </ul>
                ) : (
                  <EmptyBlock>Nenhuma campanha aberta agora.</EmptyBlock>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <BlockHeader icon={FaCalendarDays} title="Próximos eventos" to="/eventos" linkLabel="Ver todos" />
                {events.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {events.map((event) => (
                      <OngEventItem key={event.id} event={event} />
                    ))}
                  </ul>
                ) : (
                  <EmptyBlock>Nenhum evento agendado agora.</EmptyBlock>
                )}
              </div>
            </div>
          </div>
        </HomeReveal>

        {persona.kind === 'visitor' && (
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-600">
            Representa uma ONG?
            <ArrowLink to="/cadastro" state={{ preselectUserType: 'ONG' }}>
              Cadastrar instituição
            </ArrowLink>
          </p>
        )}
      </div>

      {donatingTo && <DonationModal campaign={donatingTo} onClose={closeDonation} />}
    </section>
  )
}

export default OngShowcaseSection
