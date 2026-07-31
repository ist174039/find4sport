'use client'

import { useState } from 'react'
import { toggleFollowAction } from '@/app/actions/follow'
import { Loader2 } from 'lucide-react'

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing: boolean
  pathToRevalidate?: string
  className?: string
  variant?: 'default' | 'outline'
}

export function FollowButton({ 
  targetUserId, 
  initialIsFollowing, 
  pathToRevalidate,
  className = '',
  variant = 'default'
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (loading) return
    setLoading(true)

    // Optimistic update
    setIsFollowing(!isFollowing)

    const result = await toggleFollowAction(targetUserId, pathToRevalidate)
    
    if (result.error) {
      // Revert if error
      setIsFollowing(isFollowing)
      console.error(result.error)
    } else {
      setIsFollowing(result.isFollowing || false)
    }
    
    setLoading(false)
  }

  const baseClasses = "font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-2"
  
  const variants = {
    default: isFollowing 
      ? "bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive" 
      : "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: isFollowing
      ? "border border-border text-foreground hover:border-destructive hover:text-destructive"
      : "border border-primary text-primary hover:bg-primary/10"
  }

  return (
    <button 
      onClick={handleFollow}
      disabled={loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isFollowing ? (
        'A Seguir'
      ) : (
        'Seguir'
      )}
    </button>
  )
}
