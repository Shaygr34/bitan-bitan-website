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
      singleton(S, 'taxConfig', 'הגדרות מחשבונים', 'taxConfig'),

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
                .id('parentCategories')
                .title('קטגוריות ראשיות')
                .schemaType('category')
                .child(
                  S.documentList()
                    .id('parentCategoriesList')
                    .title('קטגוריות ראשיות')
                    .filter('_type == "category" && !defined(parent)')
                    .child((categoryId) =>
                      S.list()
                        .id(`category-${categoryId}`)
                        .title('קטגוריה')
                        .items([
                          S.listItem()
                            .id(`category-detail-${categoryId}`)
                            .title('פרטי קטגוריה')
                            .child(S.document().schemaType('category').documentId(categoryId)),
                          S.listItem()
                            .id(`subcategories-${categoryId}`)
                            .title('תתי-קטגוריות')
                            .schemaType('category')
                            .child(
                              S.documentList()
                                .id(`subcategoriesList-${categoryId}`)
                                .title('תתי-קטגוריות')
                                .filter('_type == "category" && parent._ref == $parentId')
                                .params({ parentId: categoryId })
                            ),
                        ]),
                    ),
                ),
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
        .title('שותפים / כותבים')
        .schemaType('author')
        .child(S.documentTypeList('author').title('שותפים / כותבים')),

      S.listItem()
        .id('teamMember')
        .title('חברי צוות')
        .schemaType('teamMember')
        .child(S.documentTypeList('teamMember').title('חברי צוות')),

      S.listItem()
        .id('testimonial')
        .title('המלצות')
        .schemaType('testimonial')
        .child(S.documentTypeList('testimonial').title('המלצות')),

      S.listItem()
        .id('clientLogo')
        .title('לוגואים')
        .schemaType('clientLogo')
        .child(S.documentTypeList('clientLogo').title('לוגואים')),

      S.divider(),

      /* ── Leads ── */
      S.listItem()
        .id('contactLead')
        .title('פניות מהאתר')
        .schemaType('contactLead')
        .child(S.documentTypeList('contactLead').title('פניות מהאתר')),

      /* ── Newsletter ── */
      S.listItem()
        .id('newsletterSubscriber')
        .title('רשימת תפוצה')
        .schemaType('newsletterSubscriber')
        .child(S.documentTypeList('newsletterSubscriber').title('רשימת תפוצה')),

      S.divider(),

      /* ── Legal ── */
      S.listItem()
        .id('legalPage')
        .title('משפטי אתר')
        .schemaType('legalPage')
        .child(S.documentTypeList('legalPage').title('משפטי אתר')),
    ])
