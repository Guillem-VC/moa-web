'use client'

import Link from 'next/link'
import { ShoppingBag, User, ChevronDown, Search, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<any | null | undefined>(undefined)

  const items = useCartStore((state) => state.items)
  const resetCart = useCartStore((state) => state.resetCart)
  const loadCart = useCartStore((state) => state.loadCart)
  const openCart = useUIStore((state) => state.openCart)

  const pathname = usePathname()

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [showNavbar, setShowNavbar] = useState(true)
  const [isTop, setIsTop] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const lastScrollY = useRef(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // ---------------- LOAD CART ----------------
  useEffect(() => {
    loadCart()
  }, [pathname])

  // ---------------- LOAD RECENT SEARCHES ----------------
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) setRecentSearches(JSON.parse(stored))
  }, [])

  // ---------------- USER ----------------
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setUser(null)
        return
      }

      try {
        const res = await fetch('/api/auth', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (!res.ok) {
          setUser(null)
          return
        }
        const data = await res.json()
        setUser(data.user)
      } catch {
        setUser(null)
      }
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) loadUser()
        else setUser(null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  // ---------------- SCROLL ----------------
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      if (scrollY > lastScrollY.current && scrollY > 80)
        setShowNavbar(false)
      else
        setShowNavbar(true)

      setIsTop(scrollY < 20)
      lastScrollY.current = scrollY

      if (menuOpen) setMenuOpen(false)
      // NO TANQUEM searchOpen
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [menuOpen])

  // ---------------- CLICK OUTSIDE ----------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setMenuOpen(false)

      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      )
        setSearchOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ---------------- ESC CLOSE ----------------
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // ---------------- FOCUS INPUT ----------------
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [searchOpen])

  // ---------------- SEARCH ----------------
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true)
      const query = searchQuery.trim()

      const isUUID = (str: string) => {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return regex.test(str)
      }

      const orConditions = [
        `name.ilike.%${query}%`,
        `type.ilike.%${query}%`
      ]

      if (isUUID(query)) {
        orConditions.push(`id.eq.${query}`)
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, type')
        .or(orConditions.join(','))
        .limit(8)

      if (!error && data) setSearchResults(data)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  // ---------------- KEYBOARD NAV ----------------
  useEffect(() => {
    if (!searchOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchResults.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        )
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        )
      }

      if (e.key === 'Enter' && selectedIndex >= 0) {
        const selected = searchResults[selectedIndex]
        window.location.href = `/product/${selected.id}`
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen, searchResults, selectedIndex])

    // ---------------- SAVE RECENT SEARCH ----------------
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return

    const updated = [
      query,
      ...recentSearches.filter(q => q !== query)
    ].slice(0, 5)

    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // ---------------- HIGHLIGHT MATCH ----------------
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-black text-white px-1">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

    // ---------------- BODY SCROLL LOCK ----------------
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [searchOpen])

  // ---------------- LOGOUT ----------------
  const handleLogout = async () => {
    await supabase.auth.signOut()
    resetCart()
    window.location.href = '/'
  }

  // ---------------- RENDER ----------------
  return (
    <>
      <div
        className="fixed top-0 left-0 w-full z-50 transition-transform duration-300"
        style={{
          transform: showNavbar ? 'translateY(0)' : 'translateY(-120%)'
        }}
      >
        <nav
          className={`w-full px-4 md:px-8 py-4 transition-all duration-300 ${
            isTop
              ? 'bg-white/30 backdrop-blur-md shadow-none'
              : 'bg-white/95 shadow-sm'
          }`}
        >
          <div className="relative flex items-center justify-center">

            {/* LOGO (REAL CENTER) */}
            <Link
              href="/"
              className="text-2xl md:text-3xl font-display font-bold text-rose-700 select-none"
            >
              Mōa
            </Link>

            {/* RIGHT SIDE ICONS */}
            <div className="absolute right-8 flex items-center gap-8">

              {/* SEARCH */}
              <button
                onClick={() => setSearchOpen(true)}
                className="group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-black/5"
              >
                <Search className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-black" />
              </button>

              {/* CART */}
              <button
                onClick={openCart}
                className="group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-black/5"
              >
                <ShoppingBag className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-black" />

                {totalQuantity > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-medium bg-black text-white rounded-full">
                    {totalQuantity}
                  </span>
                )}
              </button>

              {/* USER */}
              {user === undefined && (
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              )}

              {/* NOT LOGGED */}
              {user === null && (
                <div className="relative group">
                  <Link href="/signin">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-black/5">
                      <User className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-black" />
                    </div>
                  </Link>

                  {/* LOGIN TOOLTIP */}
                  <div className="absolute right-0 top-12 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none">
                    <div className="px-3 py-1.5 text-xs rounded-md bg-black text-white whitespace-nowrap shadow-lg">
                      Login
                    </div>
                  </div>
                </div>
              )}

              {/* LOGGED */}
              {user && (
                <div className="relative group" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white text-sm font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </button>

                  {/* USER TOOLTIP (hidden if menu open) */}
                  {!menuOpen && (
                    <div className="absolute right-0 top-12 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none">
                      <div className="px-3 py-1.5 text-xs rounded-md bg-black text-white whitespace-nowrap shadow-lg">
                        {user.user_metadata?.full_name || user.email}
                      </div>
                    </div>
                  )}

                  {/* DROPDOWN */}
                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-44 bg-white border border-gray-100 rounded-xl shadow-lg text-sm z-50 overflow-hidden">
                      <Link
                        href="/user"
                        className="block px-5 py-3 hover:bg-gray-50 transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        Área Usuario
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-5 py-3 hover:bg-gray-50 transition"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </nav>
      </div>

      {/* ---------------- SEARCH MODAL ---------------- */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-white overflow-y-auto"
          ref={searchContainerRef}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 md:px-16 py-8 border-b border-gray-100">
            <div className="text-xl uppercase tracking-widest font-medium">
              Busqueda
            </div>
            <button
              onClick={() => {
                setSearchOpen(false)
                setSearchQuery('')
                setSearchResults([])
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Input */}
          <div className="px-8 md:px-16 pt-16 max-w-5xl mx-auto">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Que estás buscando?"
              className="w-full text-4xl md:text-5xl font-light border-b border-gray-300 focus:border-black focus:outline-none pb-6 tracking-tight"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedIndex(-1)
              }}
            />
          </div>

          <div className="px-8 md:px-16 py-16 max-w-6xl mx-auto">

            {!searchQuery && recentSearches.length > 0 && (
              <div className="mb-12">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
                  Busquedas recientes
                </h3>
                <div className="flex flex-wrap gap-3">
                  {recentSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(search)
                        setSelectedIndex(-1)
                      }}
                      className="px-4 py-2 border border-gray-300 text-sm hover:bg-black hover:text-white transition"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isSearching && (
              <div className="text-gray-400 text-lg">
                Searching...
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                {searchResults.map((prod, index) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.id}`}
                    onClick={() => {
                      saveRecentSearch(searchQuery)
                      setSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className={`group ${
                      selectedIndex === index ? 'ring-2 ring-black' : ''
                    }`}
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={prod.image_url || '/placeholder.png'}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                    </div>

                    <div className="mt-4 space-y-1">
                      <p className="text-sm uppercase tracking-wide text-gray-400">
                        Product
                      </p>
                      <p className="font-medium text-gray-900">
                        {highlightMatch(prod.name, searchQuery)}
                      </p>
                      <p className="text-sm font-semibold">
                        {prod.price}€
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="text-gray-400 text-lg">
                Producto no encontrado
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}