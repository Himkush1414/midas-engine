import { RootDocument, rootMetadata, rootViewport } from '@/components/RootDocument';
import '../globals.css';

export const metadata = rootMetadata;
export const viewport = rootViewport;

/** Root layout for the English site: the landing page, legal pages, duel links. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
