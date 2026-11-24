import { PageTitle } from '@/components/page-title';
import { PairCode } from './pair-code';

export const metadata = { title: 'Pair glasses' };

export default function PairPage() {
  return (
    <>
      <PageTitle title="Pair glasses" description="A six-digit code links your G2 session. It works once and expires after ten minutes." />
      <PairCode />
    </>
  );
}
