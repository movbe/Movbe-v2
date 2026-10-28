'use client'

import { Film, Link as LinkIcon, Mail, Send, User } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/lib/hooks/use-toast'
import { waitlistService } from '@/lib/services/WaitlistService'
import { PrivacySection } from './PrivacySection'

interface CreatorFormProps {
  onSuccess: (data: { name: string; email: string }) => void
}

export function CreatorForm({ onSuccess }: CreatorFormProps) {
  const { toast } = useToast()

  // Q1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [socialLink, setSocialLink] = useState('')

  // Q2
  const [niche, setNiche] = useState('')
  const [nicheOther, setNicheOther] = useState('')

  // Q3
  const [audienceSize, setAudienceSize] = useState('')

  // Q4
  const [censorshipHistory, setCensorshipHistory] = useState('')
  const [censorshipOther, setCensorshipOther] = useState('')

  // Q5
  const [payPerViewWillingness, setPayPerViewWillingness] = useState('')

  // Q6
  const [pitchConsent, setPitchConsent] = useState('')

  // Q7
  const [biggestProblem, setBiggestProblem] = useState('')

  // Q8
  const [betaContactConsent, setBetaContactConsent] = useState('')

  // Privacy Section 11
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [promotionalConsent, setPromotionalConsent] = useState(false)
  const [privacyError, setPrivacyError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa tu nombre y correo electrónico.',
        variant: 'destructive',
      })
      return
    }

    if (!privacyAccepted) {
      setPrivacyError(true)
      toast({
        title: 'Aceptación obligatoria',
        description: 'Debes aceptar el aviso de privacidad para registrarte.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    setPrivacyError(false)

    try {
      await waitlistService.submitWaitlist({
        waitlistType: 'creator',
        name,
        email,
        privacyAccepted,
        promotionalConsent,
        responses: {
          socialLink,
          niche: niche === 'otro' ? `Otro: ${nicheOther}` : niche,
          audienceSize,
          censorshipHistory: censorshipHistory === 'otro' ? `Otro: ${censorshipOther}` : censorshipHistory,
          payPerViewWillingness,
          pitchConsent,
          biggestProblem,
          betaContactConsent,
        },
      })

      toast({
        title: '¡Postulación enviada!',
        description: 'Te has registrado como Creador Early Adopter en Movbe con éxito.',
      })
      onSuccess({ name, email })
    } catch {
      toast({
        title: '¡Registro guardado!',
        description: 'Tu postulación de creador ha sido almacenada correctamente.',
      })
      onSuccess({ name, email })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {/* Encabezado del Formulario */}
      <div className='p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-primary/10 to-transparent border border-purple-500/20 space-y-2'>
        <div className='flex items-center gap-2 text-purple-500 font-bold text-xs uppercase tracking-wider'>
          <Film className='h-4 w-4' />
          <span>🧊 Cuestionario Early Adopters - Creadores (Movbe)</span>
        </div>
        <h3 className='text-lg sm:text-xl font-bold text-foreground'>
          Sé de los primeros creadores en Movbe (Beta LATAM)
        </h3>
        <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
          Movbe es la nueva plataforma de video para adultos verificados (no explícita) donde las
          reglas las pones tú. Gana por vista, sin censura familiar y con anunciantes premium. Estamos
          buscando a los primeros 100 creadores en LATAM para nuestra Beta. Al registrarte, entras a
          la lista de espera prioritaria.
        </p>
      </div>

      {/* Pregunta 1 */}
      <div className='space-y-4 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          1. ¿Cuál es tu nombre, correo electrónico y link a tu red social principal? *
        </Label>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='creator-q1-name' className='text-xs text-muted-foreground flex items-center gap-1'>
              <User className='h-3.5 w-3.5 text-primary' /> Nombre:
            </Label>
            <Input
              id='creator-q1-name'
              type='text'
              placeholder='Tu nombre completo o artístico'
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={isSubmitting}
              className='h-10'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='creator-q1-email' className='text-xs text-muted-foreground flex items-center gap-1'>
              <Mail className='h-3.5 w-3.5 text-primary' /> Email:
            </Label>
            <Input
              id='creator-q1-email'
              type='email'
              placeholder='correo@ejemplo.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className='h-10'
            />
          </div>
        </div>

        <div className='space-y-2 pt-1'>
          <Label htmlFor='creator-q1-social' className='text-xs text-muted-foreground flex items-center gap-1'>
            <LinkIcon className='h-3.5 w-3.5 text-purple-500' /> Link a tu Instagram, TikTok o YouTube:
          </Label>
          <Input
            id='creator-q1-social'
            type='text'
            placeholder='instagram.com/tu_usuario o youtube.com/@canal...'
            value={socialLink}
            onChange={e => setSocialLink(e.target.value)}
            disabled={isSubmitting}
            className='h-10'
          />
        </div>
      </div>

      {/* Pregunta 2 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          2. ¿Cuál es tu nicho principal de contenido para adultos?
        </Label>
        <RadioGroup value={niche} onValueChange={setNiche} className='space-y-2 pt-1'>
          {[
            'Comedia adulta / Stand-up / Podcast',
            'Fitness / Modelaje / Try-on Hauls',
            'Sensual / Creador de OnlyFans (no explícito)',
            'Gaming / Streamer sin filtros',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`niche-${opt}`} />
              <Label htmlFor={`niche-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
          <div className='flex items-center space-x-2.5 p-2.5 rounded-lg border border-transparent'>
            <RadioGroupItem value='otro' id='niche-otro' />
            <Label htmlFor='niche-otro' className='text-xs sm:text-sm cursor-pointer font-normal shrink-0'>
              Otro:
            </Label>
            <Input
              placeholder='Especifica tu nicho...'
              value={nicheOther}
              onChange={e => {
                setNicheOther(e.target.value)
                setNiche('otro')
              }}
              className='h-8 text-xs flex-1'
            />
          </div>
        </RadioGroup>
      </div>

      {/* Pregunta 3 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          3. ¿Cuál es el tamaño actual de tu audiencia?
        </Label>
        <RadioGroup value={audienceSize} onValueChange={setAudienceSize} className='space-y-2 pt-1'>
          {[
            'De 0 a 10.000 seguidores',
            'De 10.001 a 50.000 seguidores',
            'De 50.001 a 200.000 seguidores',
            'Más de 200.000 seguidores',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`audience-${opt}`} />
              <Label htmlFor={`audience-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Pregunta 4 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          4. ¿Has sufrido de demonetización, shadowban o censura en las plataformas actuales?
        </Label>
        <RadioGroup value={censorshipHistory} onValueChange={setCensorshipHistory} className='space-y-2 pt-1'>
          {[
            'Sí, YouTube me quitó la monetización por "lenguaje adulto"',
            'Sí, en OnlyFans me exigen ser explícito para ganar bien',
            'Sí, mis videos de fitness/modelaje fueron marcados como "sexuales"',
            'No, pero busco una alternativa con reglas más justas',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`censor-${opt}`} />
              <Label htmlFor={`censor-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
          <div className='flex items-center space-x-2.5 p-2.5 rounded-lg border border-transparent'>
            <RadioGroupItem value='otro' id='censor-otro' />
            <Label htmlFor='censor-otro' className='text-xs sm:text-sm cursor-pointer font-normal shrink-0'>
              Otro:
            </Label>
            <Input
              placeholder='Describe tu situación...'
              value={censorshipOther}
              onChange={e => {
                setCensorshipOther(e.target.value)
                setCensorshipHistory('otro')
              }}
              className='h-8 text-xs flex-1'
            />
          </div>
        </RadioGroup>
      </div>

      {/* Pregunta 5 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          5. Si Movbe te ofrece un modelo de pago por vista (sin necesidad de ser explícito y con anunciantes premium), ¿estarías dispuesto a mudar o crear contenido exclusivo aquí?
        </Label>
        <RadioGroup value={payPerViewWillingness} onValueChange={setPayPerViewWillingness} className='space-y-2 pt-1'>
          {[
            'Sí, definitivamente',
            'Tal vez, depende de cuánto se pueda ganar por vista',
            'No, prefiero mi plataforma actual',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`ppv-${opt}`} />
              <Label htmlFor={`ppv-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Pregunta 6 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          6. Para nuestro Pitch a inversionistas: ¿Aceptas que usemos tu perfil y tu respuesta (sin datos privados) como &ldquo;Evidencia de Demanda&rdquo; para demostrar que los creadores necesitan esta plataforma?
        </Label>
        <RadioGroup value={pitchConsent} onValueChange={setPitchConsent} className='space-y-2 pt-1'>
          {[
            'Sí, acepto que usen mi perfil público y mi testimonio.',
            'No, prefiero mantener mi participación en privado.',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`pitch-${opt}`} />
              <Label htmlFor={`pitch-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Pregunta 7 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label htmlFor='creator-biggest-problem' className='text-sm sm:text-base font-semibold block'>
          7. ¿Cuál es el mayor problema que tienes hoy con las plataformas donde publicas? (Tu respuesta nos ayuda a construir la solución exacta que necesitas)
        </Label>
        <Textarea
          id='creator-biggest-problem'
          placeholder='Escribe tu respuesta aquí...'
          value={biggestProblem}
          onChange={e => setBiggestProblem(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className='resize-none text-sm'
        />
      </div>

      {/* Pregunta 8 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          8. ¿Quieres entrar a la lista de espera y aceptas que nos pongamos en contacto contigo cuando la Beta esté lista?
        </Label>
        <RadioGroup value={betaContactConsent} onValueChange={setBetaContactConsent} className='space-y-2 pt-1'>
          {[
            'Sí, quiero ser de los primeros Early Adopters y acepto ser contactado.',
            'No por ahora.',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`contact-${opt}`} />
              <Label htmlFor={`contact-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* 11. Aviso de Privacidad y Tratamiento de Datos Personales */}
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
            Enviando postulación...
          </>
        ) : (
          <>
            <Send className='h-4 w-4 mr-2' />
            Enviar Cuestionario de Creador (Beta LATAM)
          </>
        )}
      </Button>
    </form>
  )
}
