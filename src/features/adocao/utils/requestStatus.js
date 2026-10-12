// Etapas do pedido vistas por quem doa (ONG ou protetor)
export const REQUEST_STATUS_META = {
  PENDING: { label: 'Aguardando resposta', className: 'bg-amber-50 text-amber-700' },
  ACCEPTED: { label: 'Conversando', className: 'bg-emerald-50 text-emerald-700' },
  AWAITING_DELIVERY: { label: 'Aguardando adotante', className: 'bg-sky-50 text-sky-700' },
  CONCLUDED: { label: 'Adoção concluída', className: 'bg-slate-100 text-slate-500' },
  REJECTED: { label: 'Recusado', className: 'bg-slate-100 text-slate-400' },
  CANCELLED: { label: 'Cancelado', className: 'bg-slate-100 text-slate-400' },
}
