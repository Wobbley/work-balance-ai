import Link from 'next/link'
import { AuthButton } from './AuthButton'
import { Button } from './ui/button'

export function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Work Balance
        </Link>
        <div className="flex items-center space-x-4">
          <AuthButton />
        </div>
      </div>
    </nav>
  )
}