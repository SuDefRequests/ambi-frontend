import { VisitPreferences } from '@/components/archive/VisitPreferences';
import type { Metadata } from 'next';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource-variable/dm-sans';
import '@/styles/globals.css';
export const metadata:Metadata={title:'Samvidhan — The Ambedkar Digital Archive',description:'Discover the writings, speeches, constitutional ideas and extraordinary legacy of Dr. B. R. Ambedkar.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><VisitPreferences>{children}</VisitPreferences></body></html>}
