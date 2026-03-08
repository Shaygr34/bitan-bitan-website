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
}

export function TeamSection({ members }: Props) {
  if (members.length === 0) return null

  return (
    <RevealSection className="py-space-10 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader
          centered
          subtitle="הצוות המקצועי שלנו — כאן בשבילכם."
        >
          הצוות שלנו
        </SectionHeader>

        <RevealGroup className="grid grid-cols-2 md:grid-cols-4 gap-space-5 mt-space-8 max-w-[900px] mx-auto">
          {members.map((member) => {
            const imageUrl = urlFor(member.image, 300)
            return (
              <RevealItem key={member._id}>
                <Card hover={false}>
                  <CardBody className="text-center">
                    {imageUrl ? (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-space-3">
                        <Image
                          src={imageUrl}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center mx-auto mb-space-3">
                        <User className="h-8 w-8 text-primary/30" />
                      </div>
                    )}
                    <h3 className="text-body font-semibold text-primary">
                      {member.name}
                    </h3>
                    {member.role && (
                      <p className="text-caption text-text-muted mt-1">
                        {member.role}
                      </p>
                    )}
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
