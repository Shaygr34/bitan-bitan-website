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
import intakeToken from './intakeToken'
import clientDocument from './clientDocument'
import onboardingRecord from './onboardingRecord'
import signingTemplate from './signingTemplate'
import weeklyMetrics from './weeklyMetrics'
import contentOpportunity from './contentOpportunity'
import intelligenceItem from './intelligenceItem'
import taxConfig from './taxConfig'

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
  taxConfig,

  // Intake
  intakeToken,
  clientDocument,
  onboardingRecord,
  signingTemplate,

  // Analytics
  weeklyMetrics,
  contentOpportunity,
  intelligenceItem,
]
