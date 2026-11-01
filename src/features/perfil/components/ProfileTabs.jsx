import { useState } from 'react'

function ProfileTabs({ tabs }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key)
  const activeTab = tabs.find((tab) => tab.key === activeKey)

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.key === activeKey
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveKey(tab.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-800'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* key força remontagem a cada troca de aba, disparando a animação de entrada */}
      <div key={activeKey} className="animate-fade-slide-in">
        {activeTab?.content}
      </div>
    </section>
  )
}

export default ProfileTabs