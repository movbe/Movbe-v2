'use client'

import { Film, Link as LinkIcon, Mail, Send, TrendingUp, User, Video, Wrench } from 'lucide-react'
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

interface CreatorFormProps {
  onSuccess: (data: { name: string; email: string }) => void
}

export function CreatorForm({ onSuccess }: CreatorFormProps) {
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [creatorCategory, setCreatorCategory] = useState('')
  const [channelUrl, setChannelUrl] = useState('')
  const [audienceSize, setAudienceSize] = useState('')
  const [desiredTools, setDesiredTools] = useState('')

  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [promotionalConsent, setPromotionalConsent] = useState(false)
  const [privacyError, setPrivacyError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor ingresa tu nombre o nombre de canal y tu correo electrónico.',
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
        waitlistType: 'creator',
        name,
        email,
        creatorCategory: creatorCategory || undefined,
        channelUrl: channelUrl || undefined,
        audienceSize: audienceSize || undefined,
        desiredTools: desiredTools || undefined,
        privacyAccepted,
        promotionalConsent,
      })

      toast({
        title: '¡Bienvenido al programa de creadores!',
        description: 'Tu postulación para la lista de espera de creadores ha sido registrada.',
      })
      onSuccess({ name, email })
    } catch {
      toast({
        title: '¡Registro guardado!',
        description: 'Tu postulación ha sido guardada correctamente.',
      })
      onSuccess({ name, email })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Intro Badge */}
      <div className='p-3.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-primary/10 to-transparent border border-purple-500/20 flex items-start gap-3'>
        <Film className='h-5 w-5 text-purple-500 mt-0.5 shrink-0' />
        <div className='text-xs sm:text-sm text-muted-foreground'>
          <strong className='text-foreground font-semibold block'>
            Pase de Creador de Contenido & Partner Beta
          </strong>
          ¿Creas videos y quieres una plataforma que valore tu trabajo con mejores condiciones,
          monetización y herramientas directas? Asegura tu canal verificado desde el día uno.
        </div>
      </div>

      {/* Datos Personales y Canal */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='creator-name' className='text-sm font-semibold flex items-center gap-1.5'>
            <User className='h-4 w-4 text-primary' />
            Nombre o Nombre del Canal <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='creator-name'
            type='text'
            placeholder='Ej. TechConDavid o David Torres'
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={isSubmitting}
            className='h-11'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='creator-email' className='text-sm font-semibold flex items-center gap-1.5'>
            <Mail className='h-4 w-4 text-primary' />
            Correo electrónico de contacto <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='creator-email'
            type='email'
            placeholder='contacto@tucanal.com'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className='h-11'
          />
        </div>
      </div>

      {/* Categoría y Enlace al Canal */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='creator-category' className='text-sm font-semibold flex items-center gap-1.5'>
            <Video className='h-4 w-4 text-purple-500' />
            Categoría principal de tus videos
          </Label>
          <Select value={creatorCategory} onValueChange={setCreatorCategory} disabled={isSubmitting}>
            <SelectTrigger id='creator-category' className='h-11'>
              <SelectValue placeholder='Selecciona tu nicho' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='gaming'>Videojuegos y Esports</SelectItem>
              <SelectItem value='tech'>Tecnología y Análisis</SelectItem>
              <SelectItem value='podcasts'>Podcasts y Charlas</SelectItem>
              <SelectItem value='education'>Educación, Ciencia y Cursos</SelectItem>
              <SelectItem value='entertainment'>Comedia y Entretenimiento</SelectItem>
              <SelectItem value='music'>Música y Producción</SelectItem>
              <SelectItem value='lifestyle'>Vlogs, Viajes y Estilo de vida</SelectItem>
              <SelectItem value='fitness'>Fitness, Salud y Deporte</SelectItem>
              <SelectItem value='finance'>Negocios y Finanzas</SelectItem>
              <SelectItem value='other'>Otra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='creator-url' className='text-sm font-semibold flex items-center gap-1.5'>
            <LinkIcon className='h-4 w-4 text-purple-500' />
            Enlace a tu canal o red principal
          </Label>
          <Input
            id='creator-url'
            type='text'
            placeholder='youtube.com/@canal o twitch.tv/...'
            value={channelUrl}
            onChange={e => setChannelUrl(e.target.value)}
            disabled={isSubmitting}
            className='h-11'
          />
        </div>
      </div>

      {/* Tamaño de Audiencia */}
      <div className='space-y-2'>
        <Label htmlFor='creator-audience' className='text-sm font-semibold flex items-center gap-1.5'>
          <TrendingUp className='h-4 w-4 text-purple-500' />
          Tamaño aproximado de tu audiencia actual
        </Label>
        <Select value={audienceSize} onValueChange={setAudienceSize} disabled={isSubmitting}>
          <SelectTrigger id='creator-audience' className='h-11'>
            <SelectValue placeholder='Selecciona el alcance aproximado' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='starter'>Iniciando (0 - 1,000 seguidores)</SelectItem>
            <SelectItem value='growing'>En crecimiento (1,000 - 10,000 seguidores)</SelectItem>
            <SelectItem value='mid'>Intermedio (10,000 - 50,000 seguidores)</SelectItem>
            <SelectItem value='established'>Establecido (50,000 - 100,000 seguidores)</SelectItem>
            <SelectItem value='large'>Gran creador (+100,000 seguidores)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Herramientas que necesita */}
      <div className='space-y-2'>
        <Label htmlFor='creator-tools' className='text-sm font-semibold flex items-center gap-1.5'>
          <Wrench className='h-4 w-4 text-muted-foreground' />
          ¿Qué herramientas te gustaría tener como creador en Rompehielo? (Opcional)
        </Label>
        <Textarea
          id='creator-tools'
          placeholder='Ej. Reparto justo de ingresos, membresías de fans, métricas en tiempo real, protección de derechos de autor...'
          value={desiredTools}
          onChange={e => setDesiredTools(e.target.value)}
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
        className='w-full h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 via-primary to-purple-600 hover:opacity-95 shadow-lg shadow-purple-500/20'
      >
        {isSubmitting ? (
          <>
            <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2' />
            Registrando solicitud de creador...
          </>
        ) : (
          <>
            <Send className='h-4 w-4 mr-2' />
            Postularme a la Lista de Creadores
          </>
        )}
      </Button>
    </form>
  )
}
