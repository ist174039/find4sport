import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types'
import { CategoryIcon } from '@/components/categories/category-icon'

interface CategoryCardProps { category: Category & { icon_key?: string | null }; variant?: 'default' | 'compact'; className?: string }
export function CategoryCard({ category, variant = 'default', className }: CategoryCardProps) {
 const isCompact = variant === 'compact'
 return <Link href={`/pesquisa?category=${category.slug}`} className={cn('group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg',isCompact&&'gap-3 p-3',className)}>
  <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',isCompact&&'h-10 w-10')} style={{backgroundColor:category.color?`${category.color}15`:'hsl(var(--muted))',color:category.color||'currentColor'}}><CategoryIcon iconKey={category.icon_key} slug={category.slug} name={category.name} className={cn('h-7 w-7',isCompact&&'h-5 w-5')}/></div>
  <div className="min-w-0 flex-1"><h3 className={cn('truncate font-semibold text-foreground transition-colors group-hover:text-primary',isCompact&&'text-sm font-medium')}>{category.name}</h3>{!isCompact&&<p className="mt-0.5 text-sm text-muted-foreground">{category.pro_count} profissionais</p>}</div>
 </Link>
}
interface CategoryGridProps { categories: Category[]; variant?: 'default'|'compact'; columns?:2|3|4|5|6; className?:string }
export function CategoryGrid({categories,variant='default',columns=4,className}:CategoryGridProps){const gridCols={2:'grid-cols-1 sm:grid-cols-2',3:'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',4:'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',5:'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',6:'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'};return <div className={cn('grid gap-4',gridCols[columns],className)}>{categories.map(category=><CategoryCard key={category.id} category={category} variant={variant}/>)}</div>}
