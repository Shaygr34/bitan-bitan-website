import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Sanity webhook endpoint for on-demand ISR revalidation.
 *
 * Setup in Sanity:
 *   URL:    https://<your-domain>/api/revalidate
 *   Method: POST
 *   Secret: (match SANITY_REVALIDATE_SECRET env var)
 *   Projection: { _type, slug }
 */

const secret = process.env.SANITY_REVALIDATE_SECRET

/** Map Sanity document types to the paths that need revalidating */
function pathsForType(type: string, slug?: string): string[] {
  switch (type) {
    case 'article':
      return slug
        ? ['/', '/knowledge', `/knowledge/${slug}`]
        : ['/', '/knowledge']

    case 'service':
      return ['/', '/services']

    case 'faq':
      return ['/', '/faq']

    case 'testimonial':
      return ['/']

    case 'category':
    case 'tag':
      return ['/knowledge']

    case 'author':
      return ['/about']

    case 'contactLead':
      return [] // No public pages to revalidate

    case 'siteSettings':
      // Global — every page reads site settings via layout
      return ['/']

    case 'homePage':
      return ['/']

    case 'aboutPage':
      return ['/about']

    case 'legalPage':
      return slug ? [`/${slug}`] : ['/privacy', '/terms']

    default:
      return ['/']
  }
}

export async function POST(req: NextRequest) {
  // Verify secret
  const providedSecret = req.nextUrl.searchParams.get('secret')
  if (!secret || providedSecret !== secret) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const type: string = body?._type ?? ''
    const slug: string | undefined = body?.slug?.current ?? body?.slug

    const paths = pathsForType(type, slug)

    // Revalidate each affected path
    for (const path of paths) {
      revalidatePath(path)
    }

    // Also revalidate the layout (propagates siteSettings changes)
    if (type === 'siteSettings') {
      revalidatePath('/', 'layout')
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      type,
      slug: slug ?? null,
    })
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 },
    )
  }
}
