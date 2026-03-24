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
import teamMember from './teamMember'
import testimonial from './testimonial'
import tool from './tool'
import newsletterSubscriber from './newsletterSubscriber'

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
  tool,

  // People
  author,
  teamMember,

  // Pages
  homePage,
  aboutPage,

  // Subscribers
  newsletterSubscriber,

  // Settings
  siteSettings,
]
