import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa6'
import AuthForm from '../components/AuthForm'
import AuthInput from '../components/AuthInput'
import UserTypeSelector from '../components/UserTypeSelector'

function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    userType: 'ADOTANTE',
    name: '',
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleUserTypeChange = (userType) => {
    setFormData((prev) => ({ ...prev, userType }))
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