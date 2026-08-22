import { Outlet } from 'react-router-dom'

function ChatLayout() {
  // h-screen aqui é a ÚNICA fonte da altura total — o ChatPage usa h-full
  // para herdar esse valor, evitando conflito de "100vh aninhado" (comum
  // em navegadores mobile com barra de endereço dinâmica)
  return (
    <div className="h-screen w-full overflow-hidden">
      <Outlet />
    </div>
  )
}

export default ChatLayout