const CONCEPTS: Record<string, string[]> = {
  saude: [
    'saude', 'bem estar', 'bem-estar', 'medicina', 'medico', 'medica',
    'osteopata', 'osteopatia', 'ortopedista', 'ortopedia', 'fisioterapeuta',
    'fisioterapia', 'fisiatria', 'reabilitacao', 'recuperacao', 'lesao', 'lesoes',
    'nutricionista', 'nutricao', 'psicologo', 'psicologia', 'massagem',
    'massagista', 'terapia', 'terapeuta', 'podologia', 'podologista'
  ],
  reabilitacao: ['reabilitacao', 'fisioterapia', 'fisioterapeuta', 'fisiatria', 'osteopatia', 'osteopata', 'recuperacao', 'retorno ao desporto', 'lesao', 'lesoes'],
  lesao: ['lesao', 'lesoes', 'fisioterapia', 'fisioterapeuta', 'osteopatia', 'osteopata', 'ortopedia', 'ortopedista', 'reabilitacao', 'prevencao de lesoes', 'retorno ao desporto'],
  nutricao: ['nutricao', 'nutricionista', 'plano nutricional', 'composicao corporal', 'suplementacao'],
  mental: ['mental', 'psicologia', 'psicologo', 'performance mental', 'gestao de stress', 'meditacao'],
  fitness: ['fitness', 'treino', 'treinador', 'personal trainer', 'preparador fisico', 'musculacao', 'hiit', 'treino funcional', 'condicionamento fisico'],
}

export function normalizeSearchTerm(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function expandSearchTerms(query: string) {
  const normalized = normalizeSearchTerm(query)
  if (!normalized) return []
  const terms = new Set<string>([normalized])
  for (const [concept, related] of Object.entries(CONCEPTS)) {
    if (normalized === concept || related.some(term => normalizeSearchTerm(term) === normalized)) {
      terms.add(concept)
      related.forEach(term => terms.add(normalizeSearchTerm(term)))
    }
  }
  return [...terms]
}

export function semanticMatch(value: string | null | undefined, terms: string[]) {
  if (!value) return false
  const normalized = normalizeSearchTerm(value)
  return terms.some(term => normalized.includes(term))
}
