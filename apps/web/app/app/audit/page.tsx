import { PageTitle } from '@/components/page-title';
import { AuditTable } from './audit-table';

export const metadata = { title: 'Audit log' };

export default function AuditPage() {
  return (
    <>
      <PageTitle title="Audit log" description="Every tap on the glasses: who asked, what for, the policy verdict, your decision and when." />
      <AuditTable />
    </>
  );
}
