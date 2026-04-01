import React from 'react'
import { cn } from '@/lib/utils'

interface MainButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  px?: string
  py?: string
  className?: string
}

const MainButton = ({
  children,
  px = 'px-8',
  py = 'py-3',
  className,
  ...props
}: MainButtonProps) => {
  return (
    <button
      className={cn(
        'bg-[#DB9D30] text-white font-medium rounded-full transition-all duration-200 hover:bg-[#c48a25] active:scale-95 cursor-pointer',
        px,
        py,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default MainButton
