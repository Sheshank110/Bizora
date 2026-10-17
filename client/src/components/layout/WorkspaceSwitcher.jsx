import { useNavigate } from 'react-router-dom';
import { IconCheck, IconChevronDown, IconPlus } from '@tabler/icons-react';
import useBusinessStore from '../../store/businessStore';
import Dropdown from '../ui/Dropdown';

export const WorkspaceSwitcher = () => {
  const navigate = useNavigate();
  const { businesses, activeBusiness, activeRole, setActiveBusiness } = useBusinessStore();

  if (!activeBusiness) return null;

  return (
    <Dropdown
      align="left"
      trigger={
        <button
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[var(--surface-secondary)] hover:bg-[var(--surface-elevated)] transition-colors text-left"
          aria-label="Switch workspace"
        >
          <div className="w-5 h-5 rounded bg-[#EFEFEF] dark:bg-[#181818] text-[var(--text-primary)] flex items-center justify-center shrink-0 font-bold text-[11px]">
            {activeBusiness.name?.charAt(0) || 'W'}
          </div>

          <div className="flex flex-col min-w-0 max-w-[130px] sm:max-w-[170px]">
            <span className="text-xs font-semibold text-[var(--text-primary)] truncate leading-tight">
              {activeBusiness.name}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] capitalize truncate leading-tight">
              {activeRole || 'Member'}
            </span>
          </div>

          <IconChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 stroke-[1.75]" />
        </button>
      }
    >
      {({ close }) => (
        <div className="w-60 py-1">
          <div className="px-3 py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Workspaces ({businesses.length})
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto py-0.5">
            {businesses.map((biz) => {
              const isActive = (biz.id || biz._id) === (activeBusiness.id || activeBusiness._id);
              return (
                <button
                  key={biz.id || biz._id}
                  onClick={() => {
                    setActiveBusiness(biz);
                    close();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                    isActive
                      ? 'bg-[#EFEFEF] dark:bg-[#111111] text-[#2563EB] font-semibold'
                      : 'text-[var(--text-primary)] hover:bg-[#F7F7F7] dark:hover:bg-[#111111]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-5 h-5 rounded bg-[var(--surface-secondary)] flex items-center justify-center font-bold text-[10px] text-[var(--text-secondary)] shrink-0">
                      {biz.name?.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="truncate">{biz.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] capitalize">{biz.role}</p>
                    </div>
                  </div>
                  {isActive && <IconCheck className="w-4 h-4 text-[#2563EB] shrink-0 stroke-[2]" />}
                </button>
              );
            })}
          </div>

          <div className="pt-1 mt-1 border-t border-transparent">
            <button
              onClick={() => {
                close();
                navigate('/onboarding');
              }}
              className="w-full flex items-center px-3 py-2 text-xs font-medium text-[#2563EB] hover:bg-[#F7F7F7] dark:hover:bg-[#111111] transition-colors"
            >
              Create Workspace
            </button>
          </div>
        </div>
      )}
    </Dropdown>
  );
};

export default WorkspaceSwitcher;
