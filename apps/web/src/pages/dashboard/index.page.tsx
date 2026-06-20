import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/dashboard/profile',
    permanent: false,
  },
});

export default function DashboardIndexPage() {
  return null;
}
