import { ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('rounded-2xl border border-teal-200 bg-white shadow-sm', className)}>{children}</div>
}
export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('px-4 py-3 border-b border-teal-100', className)}>{children}</div>
}
export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('p-4', className)}>{children}</div>
}

export function Button({ children, className, ...props }: any) {
  return (
    <button
      className={clsx('inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-100 hover:bg-teal-200 px-4 py-2 text-sm text-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2', className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input(props: any) {
  return <input className="w-full rounded-xl border border-teal-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2" {...props} />
}
export function Textarea(props: any) {
  return <textarea className="w-full rounded-xl border border-teal-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2" {...props} />
}
export function Progress({ value }: { value: number }) {
  return (
    <div className="h-3 w-full rounded-full bg-teal-100 overflow-hidden">
      <div className="h-3 bg-emerald-400" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}
