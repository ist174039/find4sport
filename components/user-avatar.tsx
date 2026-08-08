'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

type UserAvatarProps = {
  name: string
  src?: string | null
  size?: 'sm' | 'default' | 'lg'
  roleLabel?: string
  className?: string
}

export function UserAvatar({ name, src, size = 'default', roleLabel, className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      <AvatarImage src={src || undefined} alt={name} />
      <AvatarFallback title={roleLabel || name}>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
