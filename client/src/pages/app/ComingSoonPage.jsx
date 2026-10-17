import { motion } from 'framer-motion';
import {
  IconLayoutDashboard, IconUsers, IconFolder, IconChecklist,
  IconBriefcase, IconFileText, IconCreditCard, IconReceipt, IconPackage, IconChartBar,
  IconBell, IconFolderOpen, IconActivity, IconSettings, IconWallet,
} from '@tabler/icons-react';
import { Badge } from '../../components/ui';

const iconMap = {
  LayoutDashboard: IconLayoutDashboard,
  Users: IconUsers,
  FolderKanban: IconFolder,
  CheckSquare: IconChecklist,
  Briefcase: IconBriefcase,
  FileText: IconFileText,
  CreditCard: IconCreditCard,
  Receipt: IconReceipt,
  Package: IconPackage,
  BarChart3: IconChartBar,
  Bell: IconBell,
  FolderOpen: IconFolderOpen,
  Activity: IconActivity,
  Settings: IconSettings,
  Wallet: IconWallet,
};

const ComingSoonPage = ({ module, icon }) => {
  const Icon = iconMap[icon] || IconLayoutDashboard;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
    >
      <div className="w-14 h-14 rounded-lg bg-[var(--surface-secondary)] text-[#2563EB] flex items-center justify-center mb-4">
        <Icon size={26} stroke={1.75} />
      </div>

      <Badge variant="info" className="mb-3">Planned Module</Badge>

      <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        {module}
      </h1>

      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
        The <strong>{module}</strong> module route and navigation are configured.
      </p>

      <div className="bg-[var(--surface-primary)] p-4 rounded-lg max-w-xs w-full text-left space-y-2">
        <p className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
          Module status
        </p>
        <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
          <li>✓ Route configured</li>
          <li>✓ Layout integrated</li>
          <li>✓ Navigation item active</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default ComingSoonPage;
