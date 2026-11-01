import { NO_ADDRESS_NUMBER, maskAddressNumber } from '../../utils/masks'

// Número do endereço com só dígitos, ou "Sem número" (grava "S/N"). Assim
// ninguém escreve qualquer coisa no campo. `input` é o campo de texto do
// formulário em que ele entra (AuthInput no cadastro, FormField no resto),
// para manter o visual de cada tela. Número antigo fora do padrão aparece
// como está e só é limpo quando a pessoa digita
function AddressNumberField({ id, value, onChange, input: Input, required = false }) {
  const isWithoutNumber = value === NO_ADDRESS_NUMBER

  return (
    <div className="flex flex-col gap-2">
      <Input
        id={id}
        label="Número"
        value={value ?? ''}
        onChange={(event) => onChange(maskAddressNumber(event.target.value))}
        placeholder={isWithoutNumber ? '' : 'Ex: 120'}
        inputMode="numeric"
        autoComplete="off"
        disabled={isWithoutNumber}
        required={required && !isWithoutNumber}
      />
      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
        <input
          type="checkbox"
          checked={isWithoutNumber}
          onChange={(event) => onChange(event.target.checked ? NO_ADDRESS_NUMBER : '')}
          className="h-4 w-4 cursor-pointer rounded accent-emerald-700"
        />
        Sem número
      </label>
    </div>
  )
}

export default AddressNumberField
