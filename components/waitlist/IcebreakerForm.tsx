'use client'

import { Mail, Send, Sparkles, User } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/lib/hooks/use-toast'
import { waitlistService } from '@/lib/services/WaitlistService'
import { PrivacySection } from './PrivacySection'

interface IcebreakerFormProps {
  onSuccess: (data: { name: string; email: string }) => void
}

export function IcebreakerForm({ onSuccess }: IcebreakerFormProps) {
  const { toast } = useToast()

  // Q1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Q2
  const [roleDefinition, setRoleDefinition] = useState('')

  // Q3
  const [productType, setProductType] = useState('')

  // Q4
  const [mainNetwork, setMainNetwork] = useState('')
  const [mainNetworkOther, setMainNetworkOther] = useState('')

  // Q5
  const [videosPerMonth, setVideosPerMonth] = useState('')

  // Q6
  const [adSpendMonthly, setAdSpendMonthly] = useState('')

  // Q7
  const [sharingFrustration, setSharingFrustration] = useState('')
  const [sharingFrustrationOther, setSharingFrustrationOther] = useState('')

  // Q8
  const [icebreakerBoostBelief, setIcebreakerBoostBelief] = useState('')
  const [icebreakerWhy, setIcebreakerWhy] = useState('')

  // Q9
  const [betaContactConsent, setBetaContactConsent] = useState('')

  // Privacy Policy
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
        description: 'Debes aceptar el aviso de privacidad para registrarte.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    setPrivacyError(false)

    try {
      await waitlistService.submitWaitlist({
        waitlistType: 'icebreaker',
        name,
        email,
        privacyAccepted,
        promotionalConsent,
        responses: {
          roleDefinition,
          productType,
          mainNetwork: mainNetwork === 'otro' ? `Otro: ${mainNetworkOther}` : mainNetwork,
          videosPerMonth,
          adSpendMonthly,
          sharingFrustration: sharingFrustration === 'otro' ? `Otro: ${sharingFrustrationOther}` : sharingFrustration,
          icebreakerBoostBelief,
          icebreakerWhy,
          betaContactConsent,
        },
      })

      toast({
        title: '¡Registrado con éxito!',
        description: 'Te has unido a la lista de espera de Rompehielo.',
      })
      onSuccess({ name, email })
    } catch {
      toast({
        title: '¡Registro guardado!',
        description: 'Tu solicitud de Rompehielo ha sido registrada correctamente.',
      })
      onSuccess({ name, email })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {/* Encabezado del Formulario */}
      <div className='p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-primary/10 to-transparent border border-blue-500/20 space-y-2'>
        <div className='flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-wider'>
          <Sparkles className='h-4 w-4' />
          <span>Título del formulario: Lista de Espera - Rompehielo 🧊</span>
        </div>
        <h3 className='text-lg sm:text-xl font-bold text-foreground'>
          Lista de Espera - Rompehielo 🧊
        </h3>
        <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
          ¡Gracias por comentar &ldquo;Rompehielo&rdquo;! Estamos construyendo la nueva forma de
          compartir videos (donde se VE el video y no un link feo) y queremos que seas de los
          primeros en LATAM. Solo tomará 2 minutos. Los cupos para la Beta son limitados.
        </p>
      </div>

      {/* Pregunta 1 */}
      <div className='space-y-4 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          1. ¿Cuál es tu nombre y tu correo electrónico? *
        </Label>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='ice-q1-name' className='text-xs text-muted-foreground flex items-center gap-1'>
              <User className='h-3.5 w-3.5 text-primary' /> Nombre: *
            </Label>
            <Input
              id='ice-q1-name'
              type='text'
              placeholder='Tu nombre completo'
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={isSubmitting}
              className='h-10'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='ice-q1-email' className='text-xs text-muted-foreground flex items-center gap-1'>
              <Mail className='h-3.5 w-3.5 text-primary' /> Email: *
            </Label>
            <Input
              id='ice-q1-email'
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
      </div>

      {/* Pregunta 2 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          2. ¿Cómo te defines principalmente?
        </Label>
        <RadioGroup value={roleDefinition} onValueChange={setRoleDefinition} className='space-y-2 pt-1'>
          {[
            'Creador de contenido / Influencer',
            'Emprendedor / Dueño de negocio',
            'Empresa / Marca (con equipo)',
            'Agencia de marketing',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`role-${opt}`} />
              <Label htmlFor={`role-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Pregunta 3 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          3. ¿Qué vendes o promocionas principalmente?
        </Label>
        <RadioGroup value={productType} onValueChange={setProductType} className='space-y-2 pt-1'>
          {[
            'Producto físico (E-commerce, restaurantes, etc.)',
            'Servicio o Infoproducto (Cursos, asesorías, coaching, etc.)',
            'Ambos',
            'No vendo, solo creo contenido (Creador)',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`prod-${opt}`} />
              <Label htmlFor={`prod-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Pregunta 4 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          4. ¿Cuál es tu red principal para compartir tus videos hoy?
        </Label>
        <RadioGroup value={mainNetwork} onValueChange={setMainNetwork} className='space-y-2 pt-1'>
          {[
            'WhatsApp / Estados',
            'Instagram (Reels / DM)',
            'TikTok',
            'YouTube',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`net-${opt}`} />
              <Label htmlFor={`net-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
          <div className='flex items-center space-x-2.5 p-2.5 rounded-lg border border-transparent'>
            <RadioGroupItem value='otro' id='net-otro' />
            <Label htmlFor='net-otro' className='text-xs sm:text-sm cursor-pointer font-normal shrink-0'>
              Otro:
            </Label>
            <Input
              placeholder='Especifica tu red...'
              value={mainNetworkOther}
              onChange={e => {
                setMainNetworkOther(e.target.value)
                setMainNetwork('otro')
              }}
              className='h-8 text-xs flex-1'
            />
          </div>
        </RadioGroup>
      </div>

      {/* Pregunta 5 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          5. ¿Cuántos videos compartes al mes para publicitar tu producto, servicio o contenido?
        </Label>
        <RadioGroup value={videosPerMonth} onValueChange={setVideosPerMonth} className='space-y-2 pt-1'>
          {[
            'De 1 a 5 videos',
            'De 6 a 15 videos',
            'De 16 a 30 videos',
            'Más de 30 videos',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`vids-${opt}`} />
              <Label htmlFor={`vids-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Pregunta 6 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          6. ¿Cuánto gastas aproximadamente en publicidad en redes sociales al mes?
        </Label>
        <RadioGroup value={adSpendMonthly} onValueChange={setAdSpendMonthly} className='space-y-2 pt-1'>
          {[
            '$0 - $2.000.000 COP (aprox. $0 - $500 USD)',
            '$2.000.000 - $4.000.000 COP (aprox. $500 - $1.000 USD)',
            'Más de $4.000.000 COP (más de $1.000 USD)',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`spend-${opt}`} />
              <Label htmlFor={`spend-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Pregunta 7 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          7. ¿Cuál es tu mayor frustración cuando compartes un video por WhatsApp o redes?
        </Label>
        <RadioGroup value={sharingFrustration} onValueChange={setSharingFrustration} className='space-y-2 pt-1'>
          {[
            'Que la gente no lo abre porque solo aparece un link feo',
            'Que pierdo mi marca/nombre cuando reenvían el video',
            'Que tengo que descargar el video en el celular para poder compartirlo',
            'Que la gente desconfía del link (miedo a estafas)',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`frust-share-${opt}`} />
              <Label htmlFor={`frust-share-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
          <div className='flex items-center space-x-2.5 p-2.5 rounded-lg border border-transparent'>
            <RadioGroupItem value='otro' id='frust-share-otro' />
            <Label htmlFor='frust-share-otro' className='text-xs sm:text-sm cursor-pointer font-normal shrink-0'>
              Otro:
            </Label>
            <Input
              placeholder='Describe tu frustración...'
              value={sharingFrustrationOther}
              onChange={e => {
                setSharingFrustrationOther(e.target.value)
                setSharingFrustration('otro')
              }}
              className='h-8 text-xs flex-1'
            />
          </div>
        </RadioGroup>
      </div>

      {/* Pregunta 8 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          8. ¿Crees que &ldquo;Rompehielo&rdquo; (videos con tu voz/cara integrada y sin links feos) potenciaría la venta de tu producto o servicio?
        </Label>
        <RadioGroup value={icebreakerBoostBelief} onValueChange={setIcebreakerBoostBelief} className='space-y-2 pt-1'>
          {['Sí', 'No', 'Tal vez'].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`boost-${opt}`} />
              <Label htmlFor={`boost-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <div className='space-y-1.5 pt-2'>
          <Label htmlFor='ice-why' className='text-xs text-muted-foreground'>
            ¿Por qué? (Opcional):
          </Label>
          <Input
            id='ice-why'
            type='text'
            placeholder='Cuéntanos por qué consideras que potenciaría tus ventas...'
            value={icebreakerWhy}
            onChange={e => setIcebreakerWhy(e.target.value)}
            disabled={isSubmitting}
            className='h-10 text-xs'
          />
        </div>
      </div>

      {/* Pregunta 9 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          9. Para cerrar: ¿Quieres ser de los primeros en adoptar la versión Beta y aceptas que nos pongamos en contacto contigo a partir de febrero del 2026?
        </Label>
        <RadioGroup value={betaContactConsent} onValueChange={setBetaContactConsent} className='space-y-2 pt-1'>
          {[
            'Sí, quiero entrar a la lista de espera y acepto ser contactado.',
            'No por ahora, solo quiero recibir información.',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`beta-${opt}`} />
              <Label htmlFor={`beta-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Política de Privacidad (Privacy Policy) */}
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
            Registrando solicitud...
          </>
        ) : (
          <>
            <Send className='h-4 w-4 mr-2' />
            Enviar Formulario - Lista de Espera Rompehielo
          </>
        )}
      </Button>
    </form>
  )
}
