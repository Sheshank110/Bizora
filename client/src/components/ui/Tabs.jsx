import { useState } from 'react';

const Tabs = ({ tabs, defaultTab, onChange, variant = 'capsule', className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  if (variant === 'underline') {
    return (
      <div className={className}>
        <div className="flex gap-4 text-xs font-medium border-b border-transparent" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  relative pb-2 px-1 transition-colors flex items-center gap-1.5
                  ${isActive
                    ? 'text-[var(--text-primary)] font-semibold border-b-2 border-[#2563EB]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                {!tab.label && tab.icon && <tab.icon className="w-4 h-4 stroke-[1.75]" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-[#EFEFEF] dark:bg-[#181818] text-[var(--text-muted)]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div role="tabpanel" className="pt-4">
          {activeContent}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Clean filled segmented tab list with NO container borders */}
      <div
        className="
          p-1 rounded-md
          bg-[#EFEFEF] dark:bg-[#181818]
          inline-flex items-center gap-1
        "
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(tab.id)}
              className={`
                px-3 py-1.5 rounded text-xs font-medium transition-colors
                flex items-center gap-1.5
                ${isActive
                  ? 'bg-[#FFFFFF] dark:bg-[#222222] text-[var(--text-primary)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              {!tab.label && tab.icon && <tab.icon className="w-3.5 h-3.5 stroke-[1.75]" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive
                    ? 'bg-[#2563EB]/10 text-[#2563EB]'
                    : 'text-[var(--text-muted)]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      <div role="tabpanel" className="pt-4">
        {activeContent}
      </div>
    </div>
  );
};

export default Tabs;
