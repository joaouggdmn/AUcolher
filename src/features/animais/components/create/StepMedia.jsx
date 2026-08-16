import PhotoUploadGrid from './PhotoUploadGrid'

const SUMMARY_MAX_LENGTH = 100

function StepMedia({ formData, onChange, images, setImages }) {
  const remainingChars = SUMMARY_MAX_LENGTH - formData.summary.length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">Fotos (até 4)</label>
        <PhotoUploadGrid images={images} onChange={setImages} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">Frase de impacto (AUmatch)</label>
          <span className={`text-xs font-semibold ${remainingChars < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
            {remainingChars} caracteres restantes
          </span>
        </div>
        <textarea
          value={formData.summary}
          onChange={(e) => onChange('summary', e.target.value.slice(0, SUMMARY_MAX_LENGTH))}
          rows={2}
          placeholder="Ex: Energético e carinhoso, procura um lar cheio de aventuras!"
          className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">História completa</label>
        <textarea
          value={formData.story}
          onChange={(e) => onChange('story', e.target.value)}
          rows={6}
          placeholder="Conte a história desse pet: como foi resgatado, seu temperamento, cuidados que precisa..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
        />
      </div>
    </div>
  )
}

export default StepMedia