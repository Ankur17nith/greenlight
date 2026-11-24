import { PageTitle, SampleNote } from '@/components/page-title';
import { sampleRules } from '@/lib/mock';
import { RulesEditor } from './rules-editor';

export const metadata = { title: 'Rules' };

export default function RulesPage() {
  return (
    <>
      <PageTitle title="Rules" description="Write them once. A request that breaks a rule, or that the AI cannot judge, shows as flagged on your glasses." />
      <SampleNote />
      <RulesEditor initial={sampleRules} />
    </>
  );
}
