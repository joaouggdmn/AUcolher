import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa6'
import AuthForm from '../components/AuthForm'
import AuthInput from '../components/AuthInput'
import UserTypeSelector from '../components/UserTypeSelector'
import OngRegisterFields from '../components/OngRegisterFields'
import AvatarUploadInput from '../../../core/components/ui/AvatarUploadInput'
import { isValidCNPJ } from '../../../core/utils/cnpj'
import { useAuth } from '../../../core/context/AuthContext'
import { getErrorMessage } from '../../../core/utils/apiError'

const INITIAL_ONG_FIELDS = {
  cnpj: '',
  foundedYear: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  uf: '',
  instagram: '',
  twitter: '',
  facebook: '',
  bio: '',
}

const INITIAL_FORM = {
  userType: 'PESSOA',
  photoUrl: null,
  name: '',
  email: '',
  password: '',
  ...INITIAL_ONG_FIELDS,
}

const HERO_COPY = {
  PESSOA: {
    heading: 'Seu novo melhor amigo está a um match de distância.',
    subheading: 'Crie sua conta e comece a receber recomendações feitas sob medida para o seu estilo de vida.',
  },
  ONG: {
    heading: 'Mais visibilidade para quem espera por um lar.',
    subheading: 'Cadastre sua ONG e divulgue animais, eventos e campanhas para quem está pronto para adotar.',
  },
}

function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register } = useAuth()

  // CTAs "Sou ONG" da home e o link /cadastro-ong já abrem na aba certa
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM,
    userType: location.state?.preselectUserType === 'ONG' ? 'ONG' : 'PESSOA',
  }))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const isOng = formData.userType === 'ONG'

  const handleFieldsChange = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }))
  }

  const handleChange = (e) => {
    handleFieldsChange({ [e.target.name]: e.target.value })
  }

  const handlePhotoChange = (dataUrl) => {
    handleFieldsChange({ photoUrl: dataUrl })
  }

  const handleUserTypeChange = (userType) => {
    if (userType === formData.userType) return
    setError(null)
    setFormData((prev) => ({ ...prev, ...INITIAL_ONG_FIELDS, userType, name: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (isOng && !isValidCNPJ(formData.cnpj)) {
      setError('Informe um CNPJ válido para continuar.')
      return
    }

    setIsSubmitting(true)

    try {
      await register(formData)
      // Fluxo temporário: sem etapa PENDENTE de aprovação pelo admin — a ONG
      // já nasce ativa e segue para o login como qualquer outra conta
      navigate('/login', { state: { registered: true, email: formData.email } })
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível concluir o cadastro. Tente novamente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthForm {...HERO_COPY[formData.userType]} wide={isOng}>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">Crie sua conta</h2>
        <p className="text-sm text-slate-500">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-900">
            Entrar
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
        <div className="flex justify-center">
          <AvatarUploadInput
            value={formData.photoUrl}
            onChange={handlePhotoChange}
            fallbackInitial={formData.name?.charAt(0)?.toUpperCase()}
            size="md"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Eu sou...</label>
          <UserTypeSelector value={formData.userType} onChange={handleUserTypeChange} />
        </div>

        <div key={formData.userType} className="mt-2 animate-fade-slide-in">
          {isOng ? (
            <OngRegisterFields values={formData} onFieldsChange={handleFieldsChange} />
          ) : (
            <div className="flex flex-col gap-5">
              <AuthInput
                id="name"
                name="name"
                label="Nome completo"
                type="text"
                icon={FaUser}
                placeholder="Como podemos te chamar?"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
              <AuthInput
                id="email"
                name="email"
                label="E-mail"
                type="email"
                icon={FaEnvelope}
                placeholder="seuemail@exemplo.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
              <AuthInput
                id="password"
                name="password"
                label="Senha"
                type="password"
                icon={FaLock}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {isSubmitting ? 'Criando conta...' : isOng ? 'Cadastrar ONG' : 'Criar conta'}
        </button>

        <p className="text-center text-xs text-slate-400">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </form>
    </AuthForm>
  )
}

export default RegisterPage
