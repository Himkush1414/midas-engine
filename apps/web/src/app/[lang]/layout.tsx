import { RootDocument, rootMetadata, rootViewport } from '@/components/RootDocument';
import '../globals.css';

export const metadata = rootMetadata;
export const viewport = rootViewport;

/** Root layout for the translated landing pages: <html lang> matches the page (/es → es). */
export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <RootDocument lang={lang}>{children}</RootDocument>;
}
