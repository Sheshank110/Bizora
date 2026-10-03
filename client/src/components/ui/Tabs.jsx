import { useState } from 'react';

const Tabs = ({ tabs, defaultTab, onChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab list */}
      <div className="flex border-b border-[var(--border-default)]" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              px-4 py-2.5 text-sm font-medium transition-all duration-200
              border-b-2 -mb-px
              ${activeTab === tab.id
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-default)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panel */}
      <div role="tabpanel" className="pt-4">
        {activeContent}
      </div>
    </div>
  );
};

export default Tabs;
