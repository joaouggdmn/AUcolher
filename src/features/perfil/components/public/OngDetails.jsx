import {
  FaBuildingNgo,
  FaMapLocationDot,
  FaClock,
  FaEnvelope,
  FaIdCard,
  FaPeopleGroup,
  FaShieldHalved,
  FaArrowRight,
} from 'react-icons/fa6'
import ProfileSection from '../ProfileSection'
import { maskCNPJ } from '../../../../core/utils/masks'

function buildMapsUrl(address) {
  const query = `${address.street}, ${address.number} - ${address.district}, ${address.city} - ${address.state}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function OngDetails({ profile }) {
  const { address, visitingHours = [], team = [] } = profile
  const hasVisitInfo = Boolean(address) || visitingHours.length > 0
  const hasContactInfo = Boolean(profile.email || profile.cnpj)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ProfileSection icon={FaBuildingNgo} title="Sobre a instituição">
          {profile.bio || profile.description ? (
            <div className="flex flex-col gap-4">
              {profile.bio && (
                <p className="break-words text-lg font-semibold leading-relaxed text-brand-800">{profile.bio}</p>
              )}
              {profile.description && (
                <p className="break-words leading-relaxed text-ink-600">{profile.description}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-500">A instituição ainda não adicionou uma descrição.</p>
          )}
        </ProfileSection>
      </div>

      <div className="flex flex-col gap-6">
        {profile.isVerified && (
          <div className="flex gap-3 rounded-card border border-accent-200 bg-accent-50 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-400 text-brand-950 shadow-md ">
              <FaShieldHalved size={16} />
            </span>
            <div>
              <p className="text-base font-extrabold tracking-tight text-brand-950">Instituição verificada</p>
              <p className="mt-0.5 text-xs leading-relaxed text-accent-800">
                CNPJ ativo na Receita Federal e cadastro analisado e aprovado pela equipe AUcolher.
              </p>
            </div>
          </div>
        )}

        {hasVisitInfo && (
          <ProfileSection icon={FaMapLocationDot} title="Visitas">
            <div className="flex flex-col gap-4">
              {address && (
                <div className="text-sm text-ink-600">
                  <p className="font-semibold text-brand-950">
                    {address.street}, {address.number}
                    {address.complement && ` - ${address.complement}`}
                  </p>
                  <p>
                    {address.district} · {address.city}, {address.state}
                  </p>
                  {address.cep && <p className="text-ink-500">CEP {address.cep}</p>}
                  <a
                    href={buildMapsUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800"
                  >
                    Ver no mapa
                    <FaArrowRight size={10} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </a>
                </div>
              )}

              {visitingHours.length > 0 && (
                <ul className="flex flex-col gap-2 border-t border-line pt-4">
                  {/* Por índice: duas faixas podem ter os mesmos dias (manhã e tarde) */}
                  {visitingHours.map((slot, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm">
                      <FaClock size={12} className="mt-1 shrink-0 text-brand-600" />
                      <span>
                        <span className="font-semibold text-brand-950">{slot.days}</span>
                        <span className="block text-ink-500">{slot.hours}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ProfileSection>
        )}

        {hasContactInfo && (
          <ProfileSection icon={FaEnvelope} title="Contato">
            <ul className="flex flex-col gap-3 text-sm">
              {profile.email && (
                <li className="flex items-center gap-2.5">
                  <FaEnvelope size={12} className="shrink-0 text-brand-600" />
                  <a
                    href={`mailto:${profile.email}`}
                    className="truncate font-semibold text-brand-700 hover:text-brand-950 hover:underline"
                  >
                    {profile.email}
                  </a>
                </li>
              )}
              {profile.cnpj && (
                <li className="flex items-center gap-2.5 text-ink-600">
                  <FaIdCard size={12} className="shrink-0 text-brand-600" />
                  CNPJ {maskCNPJ(profile.cnpj)}
                </li>
              )}
            </ul>
          </ProfileSection>
        )}

        {team.length > 0 && (
          <ProfileSection icon={FaPeopleGroup} title="Equipe">
            <ul className="flex flex-col gap-3">
              {team.map((member) => (
                <li key={member.name} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-sm font-black text-brand-700">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-brand-950">{member.name}</p>
                    <p className="truncate text-xs text-ink-500">{member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </ProfileSection>
        )}
      </div>
    </div>
  )
}

export default OngDetails
