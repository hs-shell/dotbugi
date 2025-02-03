import { Card, CardContent } from '@/components/ui/card';
import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import routes from '~react-pages';

export default function App() {
  return <Suspense fallback={<p>Loading...</p>}>{useRoutes(routes)}</Suspense>;
}
