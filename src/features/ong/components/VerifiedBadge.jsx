import { FaShieldHalved } from 'react-icons/fa6'

const SIZES = {
  sm: { wrapper: 'gap-1 px-2.5 py-1 text-[11px]', icon: 10 },
  md: { wrapper: 'gap-1.5 px-3.5 py-1.5 text-xs', icon: 12 },
}

function VerifiedBadge({ size = 'md' }) {
  const styles = SIZES[size]

  return (
    <span
      title="CNPJ ativo e cadastro aprovado pela equipe AUcolher"
      className={`inline-flex w-fit items-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 font-extrabold text-emerald-950 shadow-md shadow-amber-500/30 ${styles.wrapper}`}
    >
      <FaShieldHalved size={styles.icon} />
      Instituição Verificada
    </span>
  )
}

export default VerifiedBadge
