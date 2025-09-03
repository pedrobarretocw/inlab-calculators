import { EmbedAll } from '@/components/embeds/EmbedAll'

type Props = {
  searchParams: Promise<{ article?: string; calculator?: string }>
}

export default async function EmbedAllPage({ searchParams }: Props) {
  const { article, calculator } = await searchParams
  
  return <EmbedAll articleSlug={article} initialCalculator={calculator} />
}

// Generate metadata for better SEO
export function generateMetadata() {
  return {
    title: 'Calculadoras Trabalhistas - InLab',
    description: 'Todas as calculadoras trabalhistas brasileiras em um só lugar.',
    robots: 'noindex, nofollow', // Embeds shouldn't be indexed
  }
}
