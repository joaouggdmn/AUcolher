import { FaKitMedical, FaBowlFood, FaHouseChimneyUser } from 'react-icons/fa6'

export const CATEGORIA_OPTIONS = [
  { value: 'SAUDE', label: 'Saúde / Cirurgias' },
  { value: 'ALIMENTACAO', label: 'Alimentação' },
  { value: 'ESTRUTURA', label: 'Estrutura do abrigo' },
]

export const STATUS_OPTIONS = [
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'QUASE_LA', label: 'Quase batendo a meta' },
]

export const CATEGORIA_META = {
  SAUDE: { label: 'Saúde / Cirurgias', icon: FaKitMedical, className: 'bg-rose-50 text-rose-600' },
  ALIMENTACAO: { label: 'Alimentação', icon: FaBowlFood, className: 'bg-amber-50 text-amber-700' },
  ESTRUTURA: { label: 'Estrutura do abrigo', icon: FaHouseChimneyUser, className: 'bg-sky-50 text-sky-700' },
}