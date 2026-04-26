import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '@/features/home/components/Navbar'
import { HeroSection } from '@/features/home/components/HeroSection'
import { FeaturesSection } from '@/features/home/components/FeaturesSection'
import { RolesSection } from '@/features/home/components/RolesSection'
import { HowItWorksSection } from '@/features/home/components/HowItWorksSection'
import { CtaSection } from '@/features/home/components/CtaSection'
import { Footer } from '@/features/home/components/Footer'
import { RegisterModal } from '@/features/home/components/RegisterModal'

export function HomePage() {
  const [registerOpen, setRegisterOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const openRegister = useCallback(() => setRegisterOpen(true), [])
  const closeRegister = useCallback(() => setRegisterOpen(false), [])

  useEffect(() => {
    if (!location.state?.openRegister) return
    setRegisterOpen(true)
    navigate('.', { replace: true, state: {} })
  }, [location.state, navigate])

  return (
    <div id="top" className="min-h-screen bg-page text-fg">
      <Navbar onRegisterClick={openRegister} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <RolesSection />
        <HowItWorksSection />
        <CtaSection onRegisterClick={openRegister} />
      </main>
      <Footer />
      <RegisterModal isOpen={registerOpen} onClose={closeRegister} />
    </div>
  )
}
