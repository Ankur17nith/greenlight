import { PageTitle } from '@/components/page-title';
import { Sources } from './sources';

export const metadata = { title: 'Connect' };

export default function ConnectPage() {
  return (
    <>
      <PageTitle title="Connect" description="Google sign-in cannot run inside the glasses app, so accounts are connected here." />
      <Sources />
    </>
  );
}
