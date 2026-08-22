import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaPaw,
  FaInbox,
  FaComments,
  FaArrowRightFromBracket,
} from "react-icons/fa6";
import { useReceivedRequests } from "../../hooks/useReceivedRequests";

function UserAvatarMenu({
  user,
  percentage,
  onLogout,
  isScrolled,
  onOpenChange,
}) {
  const [isOpen, setIsOpenState] = useState(false);
  const { pendingCount } = useReceivedRequests();
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "U";

  const setIsOpen = (value) => {
    setIsOpenState(value);
    onOpenChange?.(value);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  const trackColor = isScrolled
    ? "rgba(255,255,255,0.25)"
    : "rgba(6,78,59,0.15)";
  const gapBgClass = isScrolled ? "bg-emerald-800" : "bg-white";

  return (
    <div className="relative isolate">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Abrir menu da conta — perfil ${percentage}% completo`}
        className="relative h-11 w-11 shrink-0 rounded-full transition-all duration-300"
        style={{
          background: `conic-gradient(#fbbf24 ${percentage}%, ${trackColor} ${percentage}%)`,
        }}
      >
        <span
          className={`absolute inset-[3px] flex items-center justify-center overflow-hidden rounded-full text-sm font-black transition-colors duration-300 ${gapBgClass} ${
            user?.photoUrl ? "" : isScrolled ? "text-white" : "text-emerald-900"
          }`}
        >
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl shadow-emerald-950/10">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-800 text-sm font-black text-white">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-emerald-950">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="border-b border-slate-100 px-4 py-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  Perfil completo
                </span>
                <span className="font-bold text-emerald-700">
                  {percentage}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <Link
              to="/perfil"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-emerald-50"
            >
              <FaUser size={14} className="text-emerald-600" />
              Minha conta
            </Link>

            <Link
              to="/animais/criar"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-emerald-50"
            >
              <FaPaw size={14} className="text-emerald-600" />
              Cadastrar animal
            </Link>

            <Link
              to="/interesses-recebidos"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-emerald-50"
            >
              <span className="flex items-center gap-2.5">
                <FaInbox size={14} className="text-emerald-600" />
                Interesses recebidos
              </span>
              {pendingCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </Link>

            <Link
              to="/chat"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-emerald-50"
            >
              <FaComments size={14} className="text-emerald-600" />
              Chat
            </Link>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors duration-200 hover:bg-rose-50"
            >
              <FaArrowRightFromBracket size={14} />
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default UserAvatarMenu;
