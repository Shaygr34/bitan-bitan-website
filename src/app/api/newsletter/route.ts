import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'

const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN

const WRITE_CLIENT = client.withConfig({
  token,
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    // Check token presence at runtime
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

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'כתובת דוא"ל לא תקינה' }, { status: 400 })
    }

    // Validate categories
    if (!categoryIds || categoryIds.length === 0) {
      return NextResponse.json({ error: 'נא לבחור לפחות נושא אחד' }, { status: 400 })
    }

    // Check for duplicate
    const existing = await WRITE_CLIENT.fetch<number>(
      `count(*[_type == "newsletterSubscriber" && email == $email && isActive == true])`,
      { email }
    )
    if (existing > 0) {
      return NextResponse.json({ error: 'כתובת דוא"ל זו כבר רשומה לעדכונים' }, { status: 409 })
    }

    // Create subscriber
    await WRITE_CLIENT.create({
      _type: 'newsletterSubscriber',
      email,
      name: name || undefined,
      subscribedCategories: categoryIds.map((id: string) => ({
        _type: 'reference',
        _ref: id,
        _key: id,
      })),
      isActive: true,
      subscribedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Newsletter signup error:', message)
    return NextResponse.json(
      { error: 'שגיאה בהרשמה. נסו שוב.', debug: process.env.NODE_ENV === 'development' ? message : undefined },
      { status: 500 }
    )
  }
}
