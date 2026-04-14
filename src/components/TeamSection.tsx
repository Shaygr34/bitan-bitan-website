import Image from 'next/image'
import {
  SectionHeader,
  RevealSection,
  RevealGroup,
  RevealItem,
} from '@/components/ui'
import { urlFor } from '@/sanity/image'
import type { TeamMember } from '@/sanity/types'
import { User } from 'lucide-react'

type Props = {
  members: TeamMember[]
  title?: string
  subtitle?: string
}

export function TeamSection({ members, title, subtitle }: Props) {
  if (members.length === 0) return null

  return (
    <RevealSection className="py-space-10 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader
          centered
          subtitle={subtitle ?? 'הצוות המקצועי שלנו — כאן בשבילכם.'}
        >
          {title ?? 'הצוות שלנו'}
        </SectionHeader>

        <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-space-5 mt-space-8 max-w-content mx-auto">
          {members.map((member) => (
            <RevealItem key={member._id}>
              <TeamMemberCard member={member} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </RevealSection>
  )
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  const imageUrl = urlFor(member.image, 400)

  return (
    <div className="group bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gold/30">
      {/* Photo */}
      {imageUrl ? (
        <div className="relative aspect-[3/4] bg-primary/5 overflow-hidden">
          <Image
            src={imageUrl}
            alt={member.name}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-gold/5 flex items-center justify-center">
          <User className="h-16 w-16 text-primary/20" />
        </div>
      )}

      {/* Info */}
      <div className="p-space-4">
        <h3 className="text-body font-bold text-primary leading-tight">
          {member.name}
        </h3>
        {member.role && (
          <p className="text-caption text-gold-dark font-semibold mt-1 tracking-wide">
            {member.role}
          </p>
        )}
        {member.bio && (
          <p className="text-caption text-text-muted mt-2 leading-relaxed line-clamp-3">
            {member.bio}
          </p>
        )}
      </div>
    </div>
  )
}
