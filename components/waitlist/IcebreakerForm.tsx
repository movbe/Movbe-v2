'use client'

import { AtSign, KeyRound, Mail, Send, Share2, Sparkles, User } from 'lucide-react'
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

interface IcebreakerFormProps {
  onSuccess: (data: { name: string; email: string }) => void
}

export function IcebreakerForm({ onSuccess }: IcebreakerFormProps) {
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [keyword, setKeyword] = useState('')
  const [socialNetwork, setSocialNetwork] = useState('')
  const [socialHandle, setSocialHandle] = useState('')
  const [socialFeedback, setSocialFeedback] = useState('')

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
        waitlistType: 'icebreaker',
        name,
        email,
        keyword: keyword || undefined,
        socialNetwork: socialNetwork || undefined,
        socialHandle: socialHandle || undefined,
        socialFeedback: socialFeedback || undefined,
        privacyAccepted,
        promotionalConsent,
      })

      toast({
        title: '¡Bienvenido a Rompehielo!',
        description: 'Tu solicitud de acceso por redes sociales ha sido registrada con éxito.',
      })
      onSuccess({ name, email })
    } catch {
      // Local fallback in service
      toast({
        title: '¡Registro guardado!',
        description: 'Tu solicitud ha sido registrada correctamente.',
      })
      onSuccess({ name, email })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Intro Badge */}
      <div className='p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 via-primary/10 to-transparent border border-blue-500/20 flex items-start gap-3'>
        <Sparkles className='h-5 w-5 text-blue-500 mt-0.5 shrink-0' />
        <div className='text-xs sm:text-sm text-muted-foreground'>
          <strong className='text-foreground font-semibold block'>
            Pase de Acceso Rompehielo Social
          </strong>
          ¿Llegaste desde Instagram, TikTok, YouTube o con una palabra clave especial? Completa este
          formulario para recibir prioridad en el acceso a la Beta.
        </div>
      </div>

      {/* Datos Personales */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='icebreaker-name' className='text-sm font-semibold flex items-center gap-1.5'>
            <User className='h-4 w-4 text-primary' />
            Nombre completo <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='icebreaker-name'
            type='text'
            placeholder='Ej. Carlos Mendoza'
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={isSubmitting}
            className='h-11'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='icebreaker-email' className='text-sm font-semibold flex items-center gap-1.5'>
            <Mail className='h-4 w-4 text-primary' />
            Correo electrónico <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='icebreaker-email'
            type='email'
            placeholder='tu-email@ejemplo.com'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className='h-11'
          />
        </div>
      </div>

      {/* Palabra clave & Red Social */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='icebreaker-keyword' className='text-sm font-semibold flex items-center gap-1.5'>
            <KeyRound className='h-4 w-4 text-blue-500' />
            Palabra clave / Código (Opcional)
          </Label>
          <Input
            id='icebreaker-keyword'
            type='text'
            placeholder='Ej. ROMPEHIELO, TIKTOK, INSTA...'
            value={keyword}
            onChange={e => setKeyword(e.target.value.toUpperCase())}
            disabled={isSubmitting}
            className='h-11 font-mono uppercase tracking-wider'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='icebreaker-social' className='text-sm font-semibold flex items-center gap-1.5'>
            <Share2 className='h-4 w-4 text-blue-500' />
            ¿Desde qué red nos conociste?
          </Label>
          <Select value={socialNetwork} onValueChange={setSocialNetwork} disabled={isSubmitting}>
            <SelectTrigger id='icebreaker-social' className='h-11'>
              <SelectValue placeholder='Selecciona una red social' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='tiktok'>TikTok</SelectItem>
              <SelectItem value='instagram'>Instagram</SelectItem>
              <SelectItem value='youtube'>YouTube</SelectItem>
              <SelectItem value='twitter_x'>X (Twitter)</SelectItem>
              <SelectItem value='facebook'>Facebook</SelectItem>
              <SelectItem value='word_of_mouth'>Recomendación de un amigo</SelectItem>
              <SelectItem value='other'>Otra</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Usuario en redes sociales */}
      <div className='space-y-2'>
        <Label htmlFor='icebreaker-handle' className='text-sm font-semibold flex items-center gap-1.5'>
          <AtSign className='h-4 w-4 text-muted-foreground' />
          Tu usuario en redes sociales (Opcional)
        </Label>
        <Input
          id='icebreaker-handle'
          type='text'
          placeholder='@tu_usuario'
          value={socialHandle}
          onChange={e => setSocialHandle(e.target.value)}
          disabled={isSubmitting}
          className='h-11'
        />
      </div>

      {/* Feedback / Expectativas */}
      <div className='space-y-2'>
        <Label htmlFor='icebreaker-feedback' className='text-sm font-semibold'>
          ¿Qué fue lo que más llamó tu atención del contenido que viste? (Opcional)
        </Label>
        <Textarea
          id='icebreaker-feedback'
          placeholder='Cuéntanos qué viste en redes que te animó a registrarte...'
          value={socialFeedback}
          onChange={e => setSocialFeedback(e.target.value)}
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
        className='w-full h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-600 via-primary to-blue-600 hover:opacity-95 shadow-lg shadow-blue-500/20'
      >
        {isSubmitting ? (
          <>
            <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2' />
            Registrando pase Rompehielo...
          </>
        ) : (
          <>
            <Send className='h-4 w-4 mr-2' />
            Unirme con mi Pase Rompehielo
          </>
        )}
      </Button>
    </form>
  )
}
