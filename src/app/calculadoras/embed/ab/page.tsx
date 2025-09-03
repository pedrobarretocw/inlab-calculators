import { EmbedAB } from '@/components/embeds/EmbedAB'

type Props = {
  searchParams: Promise<{ article?: string }>
}

export default async function EmbedABPage({ searchParams }: Props) {
  const { article } = await searchParams
  
  return <EmbedAB articleSlug={article} />
}

// Generate metadata for better SEO
export function generateMetadata() {
  return {
    title: 'Calculadora Trabalhista - InLab',
    description: 'Calculadoras trabalhistas brasileiras para auxiliar no seu planejamento.',
    robots: 'noindex, nofollow', // Embeds shouldn't be indexed
  }
}
