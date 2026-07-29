import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaIdCard } from 'react-icons/fa6'
import AuthForm from '../components/AuthForm'
import AuthInput from '../components/AuthInput'
import UserTypeSelector from '../components/UserTypeSelector'
import { maskCNPJ } from '../../../core/utils/masks'

const INITIAL_FORM = {
  userType: 'PESSOA',
  name: '',        // Nome completo (Pessoa) OU Nome da instituição (ONG)
  cnpj: '',         // Só usado quando userType === 'ONG'
  email: '',
  password: '',
}

function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const isOng = formData.userType === 'ONG'

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCnpjChange = (e) => {
    setFormData((prev) => ({ ...prev, cnpj: maskCNPJ(e.target.value) }))
  }

  const handleUserTypeChange = (userType) => {
    // Zera nome e CNPJ ao trocar de tipo — evita levar "Nome completo" digitado
    // para o campo "Nome da instituição" (ou vice-versa) por engano
    setFormData((prev) => ({ ...prev, userType, name: '', cnpj: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // 🔴 Aqui entra a chamada real: authService.register(formData)
      console.log('Cadastro:', formData)
      navigate('/login')
    } catch {
      setError('Não foi possível concluir o cadastro. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthForm
      heading="Seu novo melhor amigo está a um match de distância."
      subheading="Crie sua conta e comece a receber recomendações feitas sob medida para o seu estilo de vida."
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-2xl font-black text-emerald-950 sm:text-3xl">
          Crie sua conta
        </h2>
        <p className="text-sm text-slate-500">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-900">
            Entrar
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Eu sou...</label>
          <UserTypeSelector value={formData.userType} onChange={handleUserTypeChange} />
        </div>

        {/* key={formData.userType} força o React a remontar este bloco ao trocar
            de tipo, o que reinicia a animação de fade-slide-in a cada alternância */}
        <div key={formData.userType} className="flex flex-col gap-5 animate-fade-slide-in">
          {isOng ? (
            <>
              <AuthInput
                id="name"
                name="name"
                label="Nome da instituição / ONG"
                type="text"
                icon={FaBuilding}
                placeholder="Ex: Abrigo Amigo Fiel"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <AuthInput
                id="cnpj"
                name="cnpj"
                label="CNPJ"
                type="text"
                icon={FaIdCard}
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={handleCnpjChange}
                inputMode="numeric"
                maxLength={18}
                required
              />

              <AuthInput
                id="email"
                name="email"
                label="E-mail institucional"
                type="email"
                icon={FaEnvelope}
                placeholder="contato@suaong.org"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </>
          ) : (
            <>
              <AuthInput
                id="name"
                name="name"
                label="Nome completo"
                type="text"
                icon={FaUser}
                placeholder="Como podemos te chamar?"
                value={formData.name}
                onChange={handleChange}
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
                required
              />
            </>
          )}

          <AuthInput
            id="password"
            name="password"
            label="Senha"
            type="password"
            icon={FaLock}
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 min-h-12 rounded-xl bg-emerald-800 font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p className="text-center text-xs text-slate-400">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </form>
    </AuthForm>
  )
}

export default RegisterPage