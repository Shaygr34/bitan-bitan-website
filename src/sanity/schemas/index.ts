import article from './article'
import author from './author'
import category from './category'
import faq from './faq'
import guide from './guide'
import service from './service'
import siteSettings from './siteSettings'
import tag from './tag'
import testimonial from './testimonial'

export const schemaTypes = [
  // Content types
  article,
  guide,

  // Taxonomy
  category,
  tag,

  // Business
  service,
  faq,
  testimonial,

  // People
  author,

  // Settings
  siteSettings,
]
