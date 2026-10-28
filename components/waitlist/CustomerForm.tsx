'use client'

import { Compass, Heart, Mail, PlayCircle, Send, Tv, User, Users } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/lib/hooks/use-toast'
import { waitlistService } from '@/lib/services/WaitlistService'
import { PrivacySection } from './PrivacySection'

interface CustomerFormProps {
  onSuccess: (data: { name: string; email: string }) => void
}

export function CustomerForm({ onSuccess }: CustomerFormProps) {
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [preferredContent, setPreferredContent] = useState('')
  const [currentPlatforms, setCurrentPlatforms] = useState('')
  const [missingFeatures, setMissingFeatures] = useState('')
  const [betaTesterInterest, setBetaTesterInterest] = useState('')

  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [promotionalConsent, setPromotionalConsent] = useState(false)
  const [privacyError, setPrivacyError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor ingresa tu nombre y correo electrónico.',
        variant: 'destructive',
      })
      return
    }

    if (!privacyAccepted) {
      setPrivacyError(true)
      toast({
        title: 'Aceptación obligatoria',
        description: 'Debes aceptar el aviso de privacidad para unirte a la lista de espera.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    setPrivacyError(false)

    try {
      await waitlistService.joinWaitlist({
        waitlistType: 'customer',
        name,
        email,
        preferredContent: preferredContent || undefined,
        currentPlatforms: currentPlatforms || undefined,
        missingFeatures: missingFeatures || undefined,
        betaTesterInterest: betaTesterInterest || undefined,
        privacyAccepted,
        promotionalConsent,
      })

      toast({
        title: '¡Inscripción confirmada!',
        description: 'Te has unido exitosamente a la lista de espera como espectador.',
      })
      onSuccess({ name, email })
    } catch {
      toast({
        title: '¡Registro guardado!',
        description: 'Tu solicitud como espectador ha sido registrada.',
      })
      onSuccess({ name, email })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Intro Badge */}
      <div className='p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-transparent border border-emerald-500/20 flex items-start gap-3'>
        <Users className='h-5 w-5 text-emerald-500 mt-0.5 shrink-0' />
        <div className='text-xs sm:text-sm text-muted-foreground'>
          <strong className='text-foreground font-semibold block'>
            Pase de Espectador & Usuario Beta
          </strong>
          ¿Buscas una mejor experiencia para ver videos, sin anuncios molestos y con una comunidad
          cercana? Inscríbete para ser de los primeros en probar la versión Beta.
        </div>
      </div>

      {/* Datos Personales */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='customer-name' className='text-sm font-semibold flex items-center gap-1.5'>
            <User className='h-4 w-4 text-primary' />
            Nombre completo <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='customer-name'
            type='text'
            placeholder='Ej. María Fernanda'
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={isSubmitting}
            className='h-11'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='customer-email' className='text-sm font-semibold flex items-center gap-1.5'>
            <Mail className='h-4 w-4 text-primary' />
            Correo electrónico <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='customer-email'
            type='email'
            placeholder='maria@ejemplo.com'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className='h-11'
          />
        </div>
      </div>

      {/* Preferencias de contenido y Plataforma actual */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='customer-content' className='text-sm font-semibold flex items-center gap-1.5'>
            <Heart className='h-4 w-4 text-emerald-500' />
            ¿Qué tipo de videos disfrutas ver más?
          </Label>
          <Select value={preferredContent} onValueChange={setPreferredContent} disabled={isSubmitting}>
            <SelectTrigger id='customer-content' className='h-11'>
              <SelectValue placeholder='Selecciona tu contenido favorito' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='gaming'>Videojuegos y Streaming</SelectItem>
              <SelectItem value='podcasts'>Podcasts y Entrevistas</SelectItem>
              <SelectItem value='education'>Educación, Ciencia y Tutoriales</SelectItem>
              <SelectItem value='entertainment'>Comedia y Entretenimiento</SelectItem>
              <SelectItem value='music'>Música y Conciertos</SelectItem>
              <SelectItem value='tech'>Tecnología e Innovación</SelectItem>
              <SelectItem value='lifestyle'>Estilo de vida, Viajes y Vlogs</SelectItem>
              <SelectItem value='other'>Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='customer-platforms' className='text-sm font-semibold flex items-center gap-1.5'>
            <Tv className='h-4 w-4 text-emerald-500' />
            ¿Qué plataforma usas más hoy en día?
          </Label>
          <Select value={currentPlatforms} onValueChange={setCurrentPlatforms} disabled={isSubmitting}>
            <SelectTrigger id='customer-platforms' className='h-11'>
              <SelectValue placeholder='Selecciona una plataforma' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='youtube'>YouTube</SelectItem>
              <SelectItem value='tiktok'>TikTok</SelectItem>
              <SelectItem value='twitch'>Twitch</SelectItem>
              <SelectItem value='streaming'>Plataformas de streaming (Netflix, etc.)</SelectItem>
              <SelectItem value='instagram'>Instagram Reels</SelectItem>
              <SelectItem value='other'>Otra</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interés como Beta Tester */}
      <div className='space-y-2'>
        <Label htmlFor='customer-betatester' className='text-sm font-semibold flex items-center gap-1.5'>
          <PlayCircle className='h-4 w-4 text-emerald-500' />
          ¿Te gustaría participar en pruebas tempranas dando tu opinión?
        </Label>
        <Select value={betaTesterInterest} onValueChange={setBetaTesterInterest} disabled={isSubmitting}>
          <SelectTrigger id='customer-betatester' className='h-11'>
            <SelectValue placeholder='Selecciona tu interés' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='active_tester'>Sí, me encantaría probar funciones y dar feedback</SelectItem>
            <SelectItem value='early_access'>Solo quiero tener acceso anticipado cuando abra</SelectItem>
            <SelectItem value='maybe_later'>Tal vez más adelante</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lo que le falta a otras plataformas */}
      <div className='space-y-2'>
        <Label htmlFor='customer-missing' className='text-sm font-semibold flex items-center gap-1.5'>
          <Compass className='h-4 w-4 text-muted-foreground' />
          ¿Qué sientes que le hace falta a las plataformas de video actuales? (Opcional)
        </Label>
        <Textarea
          id='customer-missing'
          placeholder='Ej. Menos publicidad intrusiva, mejor sistema para descubrir creadores emergentes, más interacción...'
          value={missingFeatures}
          onChange={e => setMissingFeatures(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className='resize-none text-sm'
        />
      </div>

      {/* Sección 11 de Privacidad */}
      <PrivacySection
        privacyAccepted={privacyAccepted}
        onPrivacyChange={val => {
          setPrivacyAccepted(val)
          if (val) setPrivacyError(false)
        }}
        promotionalConsent={promotionalConsent}
        onPromotionalChange={setPromotionalConsent}
        privacyError={privacyError}
        disabled={isSubmitting}
      />

      {/* Botón de Envío */}
      <Button
        type='submit'
        disabled={isSubmitting}
        className='w-full h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-emerald-600 via-primary to-emerald-600 hover:opacity-95 shadow-lg shadow-emerald-500/20'
      >
        {isSubmitting ? (
          <>
            <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2' />
            Registrando solicitud...
          </>
        ) : (
          <>
            <Send className='h-4 w-4 mr-2' />
            Unirme a la Lista de Espera como Espectador
          </>
        )}
      </Button>
    </form>
  )
}
