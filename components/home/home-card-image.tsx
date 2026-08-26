import { Building2, type LucideIcon } from 'lucide-react'
import { HomeCardImageClient } from '@/components/home/home-card-image-client'

export function HomeCardImage({ src, alt, icon }: { src?: string | null; alt: string; icon: LucideIcon }) {
  return <HomeCardImageClient src={src} alt={alt} kind={icon === Building2 ? 'space' : 'people'} />
}
