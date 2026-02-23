import type { StructureBuilder } from 'sanity/structure'

/**
 * Custom Studio desk structure with Hebrew-labelled groups.
 *
 * Singletons (siteSettings, homePage, aboutPage) are shown as direct
 * document editors — no list → click → edit flow needed.
 */

const singleton = (S: StructureBuilder, id: string, title: string, schemaType: string) =>
  S.listItem()
    .id(id)
    .title(title)
    .child(S.document().schemaType(schemaType).documentId(id))

export const structure = (S: StructureBuilder) =>
  S.list()
    .id('root')
    .title('ניהול תוכן')
    .items([
      /* ── Settings ── */
      singleton(S, 'siteSettings', 'הגדרות אתר', 'siteSettings'),

      S.divider(),

      /* ── Pages ── */
      singleton(S, 'homePage', 'דף הבית', 'homePage'),
      singleton(S, 'aboutPage', 'אודות', 'aboutPage'),

      S.divider(),

      /* ── Services ── */
      S.listItem()
        .id('service')
        .title('שירותים')
        .schemaType('service')
        .child(S.documentTypeList('service').title('שירותים')),

      /* ── Knowledge Centre ── */
      S.listItem()
        .id('knowledgeCentre')
        .title('מרכז ידע')
        .child(
          S.list()
            .id('knowledgeCentreList')
            .title('מרכז ידע')
            .items([
              S.listItem()
                .id('article')
                .title('מאמרים')
                .schemaType('article')
                .child(S.documentTypeList('article').title('מאמרים')),
              S.listItem()
                .id('guide')
                .title('מדריכים')
                .schemaType('guide')
                .child(S.documentTypeList('guide').title('מדריכים')),
              S.listItem()
                .id('category')
                .title('קטגוריות')
                .schemaType('category')
                .child(S.documentTypeList('category').title('קטגוריות')),
              S.listItem()
                .id('tag')
                .title('תגיות')
                .schemaType('tag')
                .child(S.documentTypeList('tag').title('תגיות')),
            ]),
        ),

      /* ── FAQ ── */
      S.listItem()
        .id('faq')
        .title('שאלות נפוצות')
        .schemaType('faq')
        .child(S.documentTypeList('faq').title('שאלות נפוצות')),

      S.divider(),

      /* ── People & Social Proof ── */
      S.listItem()
        .id('author')
        .title('צוות')
        .schemaType('author')
        .child(S.documentTypeList('author').title('צוות')),

      S.listItem()
        .id('testimonial')
        .title('המלצות')
        .schemaType('testimonial')
        .child(S.documentTypeList('testimonial').title('המלצות')),

      S.divider(),

      /* ── Legal ── */
      S.listItem()
        .id('legalPage')
        .title('משפטי אתר')
        .schemaType('legalPage')
        .child(S.documentTypeList('legalPage').title('משפטי אתר')),
    ])
