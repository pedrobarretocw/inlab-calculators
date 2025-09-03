import { EmbedAll } from '@/components/embeds/EmbedAll'

type Props = {
  searchParams: Promise<{ article?: string }>
}

export default async function EmbedAllPage({ searchParams }: Props) {
  const { article } = await searchParams
  
  return <EmbedAll articleSlug={article} />
}

// Generate metadata for better SEO
export function generateMetadata() {
  return {
    title: 'Calculadoras Trabalhistas - InLab',
    description: 'Todas as calculadoras trabalhistas brasileiras em um só lugar.',
    robots: 'noindex, nofollow', // Embeds shouldn't be indexed
  }
}
