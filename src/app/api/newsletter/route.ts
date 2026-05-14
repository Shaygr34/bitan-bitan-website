import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'

const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN

const WRITE_CLIENT = client.withConfig({
  token,
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    if (!token) {
      console.error('Newsletter: SANITY_API_TOKEN is not set')
      return NextResponse.json(
        { error: 'שגיאת תצורה בשרת. פנו אלינו ישירות.' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { email, name, categoryIds } = body as {
      email?: string
      name?: string
      categoryIds?: string[]
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'כתובת דוא"ל לא תקינה' }, { status: 400 })
    }

    const existing = await WRITE_CLIENT.fetch<number>(
      `count(*[_type == "newsletterSubscriber" && email == $email && isActive == true])`,
      { email }
    )
    if (existing > 0) {
      return NextResponse.json(
        { error: 'כתובת דוא"ל זו כבר רשומה לעדכונים' },
        { status: 409 }
      )
    }

    // Default to all categories when caller doesn't specify.
    // Schema requires subscribedCategories.min(1); fetch live list so the field
    // stays meaningful if/when segmentation is wired in later.
    let resolvedCategoryIds = categoryIds ?? []
    if (resolvedCategoryIds.length === 0) {
      const all = await WRITE_CLIENT.fetch<string[]>(
        `*[_type == "category"]._id`
      )
      resolvedCategoryIds = all
    }

    if (resolvedCategoryIds.length === 0) {
      console.error('Newsletter: no categories available to assign')
      return NextResponse.json(
        { error: 'שגיאת תצורה. פנו אלינו ישירות.' },
        { status: 500 }
      )
    }

    await WRITE_CLIENT.create({
      _type: 'newsletterSubscriber',
      email,
      name: name || undefined,
      subscribedCategories: resolvedCategoryIds.map((id: string) => ({
        _type: 'reference',
        _ref: id,
        _key: id,
      })),
      isActive: true,
      subscribedAt: new Date().toISOString(),
    })

    console.log(`Newsletter: new subscriber ${email}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Newsletter signup error:', message)
    return NextResponse.json(
      {
        error: 'שגיאה בהרשמה. נסו שוב.',
        debug: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    )
  }
}
