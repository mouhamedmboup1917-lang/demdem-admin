// Roboto is loaded via <link> in metadata to avoid network dependency at build time
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';
import AdminShell from '@/components/AdminShell';


export const metadata = {
  title: 'DemDem Admin — Back-Office',
  description: 'Panneau d\'administration sécurisé pour l\'\u00e9cosystème mobile DemDem',
  other: {
    'google-fonts': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#f7f6f3]" style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}>
        <AuthProvider>
          <RoleProvider>
            <AdminShell>
              {children}
            </AdminShell>
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
