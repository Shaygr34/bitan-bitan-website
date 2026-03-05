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
    <div style={{ height: '100vh' }}>
      {children}
    </div>
  )
}
