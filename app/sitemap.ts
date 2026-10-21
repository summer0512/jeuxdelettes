import { MetadataRoute } from 'next'
import { languages } from '@/i18n/config'
import { SUPPORTED_GUIDE_LENGTHS } from '@/lib/guide-lengths'
import { DEFAULT_GAME_LENGTH } from '@/lib/routes'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jeuxdelettes.com'
  const currentDate = new Date().toISOString()

  const basePages = [
    {
      url: '',
      priority: 1.0,
      changeFrequency: 'weekly' as const,
    },
    {
      url: 'guide-sutom',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    },
    {
      url: 'solveur-sutom',
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    },
    {
      url: 'sutom-du-jour',
      priority: 0.85,
      changeFrequency: 'daily' as const,
    },
    {
      url: 'indice-sutom',
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    },
    {
      url: 'solution-sutom',
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    },
    {
      url: 'confidentialite',
      priority: 0.3,
      changeFrequency: 'yearly' as const,
    },
    {
      url: 'conditions-utilisation',
      priority: 0.3,
      changeFrequency: 'yearly' as const,
    },
  ]

  const lengthPages = Array.from({ length: 9 }, (_, index) => index + 3).flatMap((length) => {
    const pages = [
      {
        url: `solveur-sutom-${length}-lettres`,
        priority: 0.85,
        changeFrequency: 'weekly' as const,
      },
    ]

    if (length !== DEFAULT_GAME_LENGTH) {
      pages.unshift({
        url: `sutom-${length}-lettres`,
        priority: 0.9,
        changeFrequency: 'weekly' as const,
      })
    }

    return pages
  })

  const guidePages = SUPPORTED_GUIDE_LENGTHS.map((length) => ({
    url: `guide-sutom-${length}-lettres`,
    priority: 0.75,
    changeFrequency: 'monthly' as const,
  }))

  const pages = [...basePages, ...lengthPages, ...guidePages]

  const sitemap: MetadataRoute.Sitemap = []

  pages.forEach((page) => {
    languages.forEach((language) => {
      let url: string

      if (page.url === '') {
        if (language.value === 'fr') {
          url = baseUrl
        } else {
          url = `${baseUrl}/${language.value}`
        }
      } else {
        if (language.value === 'fr') {
          url = `${baseUrl}/${page.url}`
        } else {
          url = `${baseUrl}/${language.value}/${page.url}`
        }
      }

      sitemap.push({
        url,
        lastModified: currentDate,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    })
  })

  return sitemap
}
