'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { table } from '@sanity/table'
import { schemaTypes } from '@/sanity/schemas'
import { structure } from '@/sanity/deskStructure'
import { apiVersion, dataset, projectId } from '@/sanity/env'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
  },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    table(),
  ],
  // Hebrew studio UI title
  title: 'ביטן את ביטן — ניהול תוכן',
})
