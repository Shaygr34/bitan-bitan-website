import Image from 'next/image'
import {
  SectionHeader,
  Card,
  CardBody,
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

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-5 mt-space-8 max-w-content mx-auto">
          {members.map((member) => {
            const imageUrl = urlFor(member.image, 300)
            return (
              <RevealItem key={member._id}>
                <Card hover={false} className="h-full">
                  <CardBody className="flex items-start gap-space-4">
                    {imageUrl ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={imageUrl}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center shrink-0">
                        <User className="h-7 w-7 text-primary/30" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-body font-semibold text-primary">
                        {member.name}
                      </h3>
                      {member.role && (
                        <p className="text-caption text-gold font-medium mt-0.5">
                          {member.role}
                        </p>
                      )}
                      {member.bio && (
                        <p className="text-caption text-text-muted mt-1.5 leading-relaxed">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </RevealSection>
  )
}
