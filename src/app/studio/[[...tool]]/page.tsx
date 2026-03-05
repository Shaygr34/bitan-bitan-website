'use client'

import dynamic from 'next/dynamic'

const StudioContent = dynamic(
  () => import('./StudioContent'),
  { ssr: false, loading: () => <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>טוען סטודיו…</div> }
)

export default function StudioPage() {
  return <StudioContent />
}
