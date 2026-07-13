import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaEnvelope, FaLock } from 'react-icons/fa6'
import AuthForm from '../components/AuthForm'
import AuthInput from '../components/AuthInput'
import { useAuth } from '../../../core/context/AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await login(formData)
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    } catch {
      setError('E-mail ou senha inválidos. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthForm
      heading="Encontre o amor da sua vida em poucos cliques."
      subheading="Milhares de pets esperando por um match perfeito. Entre e continue sua jornada de adoção."
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-2xl font-black text-emerald-950 sm:text-3xl">
          Bem-vindo de volta
        </h2>
        <p className="text-sm text-slate-500">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-emerald-700 hover:text-emerald-900">
            Cadastre-se
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
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
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Link
            to="/recuperar-senha"
            className="text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900"
          >
            Esqueci minha senha
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 min-h-12 rounded-xl bg-emerald-800 font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthForm>
  )
}

export default LoginPage