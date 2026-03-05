import aboutPage from './aboutPage'
import article from './article'
import author from './author'
import category from './category'
import clientLogo from './clientLogo'
import contactLead from './contactLead'
import faq from './faq'

import homePage from './homePage'
import legalPage from './legalPage'
import service from './service'
import siteSettings from './siteSettings'
import tag from './tag'
import testimonial from './testimonial'

export const schemaTypes = [
  // Content types
  article,
  legalPage,

  // Taxonomy
  category,
  tag,

  // Business
  service,
  faq,
  testimonial,
  clientLogo,
  contactLead,

  // People
  author,

  // Pages
  homePage,
  aboutPage,

  // Settings
  siteSettings,
]
