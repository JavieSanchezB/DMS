export const metadata = {
  title: 'Visitas',
  description: 'Registrar una visita consu ubicación',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
