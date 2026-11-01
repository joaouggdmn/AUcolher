import { FaShieldHalved } from 'react-icons/fa6'

const SIZES = {
  sm: { wrapper: 'gap-1 px-2.5 py-1 text-[11px]', icon: 10 },
  md: { wrapper: 'gap-1.5 px-3.5 py-1.5 text-xs', icon: 12 },
}

function VerifiedBadge({ size = 'md' }) {
  const styles = SIZES[size]

  return (
    <span
      title="ONG cadastrada com CNPJ na AUcolher"
      className={`inline-flex w-fit items-center rounded-full bg-accent-400 font-extrabold text-brand-950 shadow-md ${styles.wrapper}`}
    >
      <FaShieldHalved size={styles.icon} />
      Instituição Verificada
    </span>
  )
}

export default VerifiedBadge
