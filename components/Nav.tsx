'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Roster' },
  { href: '/performance', label: 'Performance' },
  { href: '/qa', label: 'QA' },
  { href: '/callouts', label: 'Call Outs' },
  { href: '/growth', label: 'Growth Convos' },
  { href: '/coaching', label: '1:1 Notes' },
  { href: '/notes', label: 'Ad-Hoc Notes' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="bg-white border-b" style={{ borderColor: '#c5dfc9' }}>
      <div className="max-w-7xl mx-auto px-5 flex items-center gap-1 h-13">
        <span className="font-bold mr-5 text-sm tracking-wide" style={{ color: '#3a7d44' }}>
          Team Novelo Dashboard
        </span>
        {links.map((l) => {
          const active = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-green-50'
              }`}
              style={active ? { backgroundColor: '#3a7d44' } : {}}
            >
              {l.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
