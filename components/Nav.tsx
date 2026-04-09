'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Roster' },
  { href: '/qa', label: 'QA' },
  { href: '/callouts', label: 'Call Outs' },
  { href: '/growth', label: 'Growth Convos' },
  { href: '/coaching', label: '1:1 Notes' },
  { href: '/notes', label: 'Ad-Hoc Notes' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="bg-white border-b shadow-sm" style={{ borderColor: '#ccfbce' }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="font-bold mr-4 text-sm" style={{ color: '#00c805' }}>Team Manager</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              pathname === l.href
                ? 'text-white'
                : 'text-gray-600 hover:bg-green-50'
            }`}
            style={pathname === l.href ? { backgroundColor: '#00c805' } : {}}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
