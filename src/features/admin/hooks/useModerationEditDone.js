import { useLocation, useNavigate } from 'react-router-dom'
import { useAdminPanel } from '../panel/useAdminPanel'

// Depois de salvar uma edição da moderação: volta para a página do site de
// onde o admin veio (o "Editar" do anúncio, do perfil, do evento ou da
// campanha manda `state.from`), com o aviso no `flash`; sem ela, volta para a
// lista do painel com o aviso do próprio painel
export function useModerationEditDone(listPath) {
  const navigate = useNavigate()
  const location = useLocation()
  const { notify } = useAdminPanel()
  const from = location.state?.from ?? null

  return {
    backTo: from ?? listPath,
    done(message) {
      if (from) {
        navigate(from, { state: { flash: message } })
      } else {
        notify(message)
        navigate(listPath)
      }
    },
  }
}
