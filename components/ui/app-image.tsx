'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type AppImageProps = Omit<ImageProps, 'src'> & {
  src: string
  fallbackSrc?: string
}

function isOptimizableSource(src: string) {
  if (src.startsWith('/')) return true
  if (src.startsWith('blob:') || src.startsWith('data:')) return false

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return false

  try {
    const sourceUrl = new URL(src)
    const storageUrl = new URL(supabaseUrl)
    return sourceUrl.protocol === storageUrl.protocol && sourceUrl.host === storageUrl.host && sourceUrl.pathname.startsWith('/storage/v1/object/')
  } catch {
    return false
  }
}

export function AppImage({ src, fallbackSrc = '/placeholder.svg', alt, fill, className, sizes, onError, ...props }: AppImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const currentSrc = failedSrc === src ? fallbackSrc : src || fallbackSrc
  const handleError: NonNullable<ImageProps['onError']> = event => {
    if (currentSrc !== fallbackSrc) setFailedSrc(src)
    onError?.(event)
  }

  if (isOptimizableSource(currentSrc)) {
    return <Image src={currentSrc} alt={alt} fill={fill} className={className} sizes={sizes} onError={handleError} {...props} />
  }

  const nativeProps = props as Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>

  // External provider avatars, data URLs and local blob previews deliberately bypass
  // the Next image proxy. This keeps the optimizer restricted to trusted storage.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={currentSrc} alt={alt} className={cn(fill && 'absolute inset-0 h-full w-full', className)} onError={handleError} {...nativeProps} />
}
