export const metadata = {
  title: 'ביטן את ביטן — ניהול תוכן',
  description: 'Sanity Studio — ביטן את ביטן רואי חשבון',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
