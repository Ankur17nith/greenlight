import { PageTitle } from '@/components/page-title';
import { QueueList } from './queue-list';

export const metadata = { title: 'Queue' };

export default function QueuePage() {
  return (
    <>
      <PageTitle title="Queue" description="What is waiting for your decision. You answer these on the glasses; this is the same list." />
      <QueueList />
    </>
  );
}
