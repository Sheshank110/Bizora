import { motion } from 'framer-motion';
import { IconShield } from '@tabler/icons-react';
import { Badge } from '../../components/ui';

const AdminComingSoonPage = ({ module }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
  >
    <div className="w-14 h-14 rounded-lg bg-[var(--surface-secondary)] text-[#2563EB] flex items-center justify-center mb-4">
      <IconShield size={26} stroke={1.75} />
    </div>
    <Badge variant="warning" className="mb-3">Super Admin Planned Module</Badge>
    <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">{module}</h1>
    <p className="text-xs text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
      This admin module route is configured.
    </p>
    <div className="bg-[var(--surface-primary)] p-4 rounded-lg max-w-xs w-full text-left space-y-1 text-xs text-[var(--text-secondary)]">
      <div>✓ Route configured</div>
      <div>✓ Admin layout integrated</div>
    </div>
  </motion.div>
);

export default AdminComingSoonPage;
