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
    <div className="fixed inset-0 z-[9999] bg-white">
      {children}
    </div>
  )
}
