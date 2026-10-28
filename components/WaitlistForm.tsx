'use client'

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Mail,
  Send,
  Shield,
  Sparkles,
  User,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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

export function WaitlistForm() {
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [answers, setAnswers] = useState('')

  // Checkboxes
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [promotionalConsent, setPromotionalConsent] = useState(false)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showFullPrivacy, setShowFullPrivacy] = useState(true)
  const [privacyError, setPrivacyError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor, completa tu nombre y correo electrónico.',
        variant: 'destructive',
      })
      return
    }

    if (!privacyAccepted) {
      setPrivacyError(true)
      toast({
        title: 'Aceptación obligatoria',
        description:
          'Debes leer y aceptar el aviso de privacidad para unirte a la lista de espera.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    setPrivacyError(false)

    try {
      await waitlistService.joinWaitlist({
        name,
        email,
        role: role || 'normal',
        answers,
        privacyAccepted,
        promotionalConsent,
      })

      setIsSubmitted(true)
      toast({
        title: '¡Inscripción exitosa!',
        description:
          'Te has registrado correctamente en la lista de espera de Rompehielo. Te contactaremos pronto.',
      })
    } catch {
      // Even if Firestore throws, offline entry was saved locally in service
      setIsSubmitted(true)
      toast({
        title: '¡Registro guardado!',
        description: 'Tu solicitud para la lista de espera de Rompehielo ha sido registrada.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setName('')
    setEmail('')
    setRole('')
    setAnswers('')
    setPrivacyAccepted(false)
    setPromotionalConsent(false)
    setIsSubmitted(false)
    setPrivacyError(false)
  }

  if (isSubmitted) {
    return (
      <Card className='w-full max-w-2xl mx-auto border border-primary/20 bg-card/95 shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300'>
        <CardContent className='pt-10 pb-8 px-6 text-center space-y-6'>
          <div className='w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5'>
            <CheckCircle2 className='h-10 w-10 text-primary' />
          </div>

          <div className='space-y-2'>
            <Badge variant='outline' className='bg-primary/5 text-primary border-primary/20 px-3 py-1'>
              <Sparkles className='h-3.5 w-3.5 mr-1.5' /> Lista de Espera Rompehielo
            </Badge>
            <h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>
              ¡Gracias por registrarte, {name}!
            </h2>
            <p className='text-muted-foreground max-w-md mx-auto text-sm sm:text-base'>
              Hemos recibido tus datos correctamente. Te contactaremos a{' '}
              <span className='font-semibold text-foreground'>{email}</span> cuando la versión Beta
              y el acceso anticipado de <span className='text-primary font-medium'>Rompehielo</span>{' '}
              estén disponibles.
            </p>
          </div>

          <div className='p-4 rounded-xl bg-muted/40 border border-muted text-xs sm:text-sm text-muted-foreground text-left space-y-2'>
            <div className='flex items-center gap-2 text-foreground font-medium'>
              <Info className='h-4 w-4 text-primary shrink-0' />
              <span>Resumen de tu registro</span>
            </div>
            <p>
              &bull; <strong className='text-foreground'>Aviso de privacidad:</strong> Aceptado
            </p>
            <p>
              &bull; <strong className='text-foreground'>Comunicaciones promocionales:</strong>{' '}
              {promotionalConsent ? 'Autorizadas' : 'No autorizadas'}
            </p>
            <p>
              &bull; <strong className='text-foreground'>Consultas de privacidad:</strong> Escríbenos a{' '}
              <a href='mailto:movbe58@gmail.com' className='text-primary hover:underline'>
                movbe58@gmail.com
              </a>
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 justify-center pt-2'>
            <Button asChild className='bg-primary hover:bg-primary/90'>
              <Link href='/explore'>Explorar Movbe</Link>
            </Button>
            <Button variant='outline' onClick={handleReset}>
              Inscribir a otra persona
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='w-full max-w-3xl mx-auto border shadow-2xl bg-card/95 backdrop-blur-sm'>
      <CardHeader className='space-y-3 pb-6 text-center sm:text-left'>
        <div className='flex items-center justify-center sm:justify-start gap-2'>
          <Badge
            variant='outline'
            className='bg-primary/10 text-primary border-primary/30 px-3 py-1 font-medium'
          >
            <Sparkles className='h-3.5 w-3.5 mr-1.5' /> Acceso Anticipado &bull; Beta
          </Badge>
        </div>
        <CardTitle className='text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text'>
          Únete a la Lista de Espera de Rompehielo
        </CardTitle>
        <CardDescription className='text-sm sm:text-base leading-relaxed'>
          Completa el formulario para asegurar tu lugar en el lanzamiento de la versión Beta de
          Rompehielo en Movbe y recibir novedades exclusivas sobre la disponibilidad y acceso
          anticipado.
        </CardDescription>
      </CardHeader>

      <CardContent className='p-4 sm:p-6 sm:pt-0'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Datos Personales */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='waitlist-name' className='text-sm font-semibold flex items-center gap-1.5'>
                <User className='h-4 w-4 text-primary' />
                Nombre completo <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='waitlist-name'
                type='text'
                placeholder='Ej. Laura Gómez'
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={isSubmitting}
                className='h-11'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='waitlist-email' className='text-sm font-semibold flex items-center gap-1.5'>
                <Mail className='h-4 w-4 text-primary' />
                Correo electrónico <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='waitlist-email'
                type='email'
                placeholder='tucorreo@ejemplo.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className='h-11'
              />
            </div>
          </div>

          {/* Rol / Perfil */}
          <div className='space-y-2'>
            <Label htmlFor='waitlist-role' className='text-sm font-semibold'>
              ¿Cómo te describirías mejor en Movbe? (Opcional)
            </Label>
            <Select value={role} onValueChange={setRole} disabled={isSubmitting}>
              <SelectTrigger id='waitlist-role' className='h-11'>
                <SelectValue placeholder='Selecciona tu perfil de usuario' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='creator'>Creador de contenido</SelectItem>
                <SelectItem value='viewer'>Espectador / Usuario regular</SelectItem>
                <SelectItem value='business'>Empresa, Marca o Negocio</SelectItem>
                <SelectItem value='developer'>Desarrollador / Entusiasta de tecnología</SelectItem>
                <SelectItem value='other'>Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Respuestas / Feedback */}
          <div className='space-y-2'>
            <Label htmlFor='waitlist-answers' className='text-sm font-semibold'>
              ¿Qué esperas o qué te gustaría ver en la versión Beta de Rompehielo? (Opcional)
            </Label>
            <Textarea
              id='waitlist-answers'
              placeholder='Comparte tus expectativas, ideas de funciones o por qué te interesa unirte...'
              value={answers}
              onChange={e => setAnswers(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className='resize-none text-sm'
            />
          </div>

          {/* 11. Aviso de privacidad y tratamiento de datos personales */}
          <div className='rounded-xl border bg-muted/20 p-4 sm:p-5 space-y-4'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-center gap-2'>
                <Shield className='h-5 w-5 text-primary shrink-0' />
                <div>
                  <h3 className='font-semibold text-sm sm:text-base text-foreground'>
                    11. Aviso de privacidad y tratamiento de datos personales
                  </h3>
                  <p className='text-xs text-muted-foreground'>
                    Responsable: Movbe &bull; Contacto:{' '}
                    <a
                      href='mailto:movbe58@gmail.com'
                      className='text-primary hover:underline font-medium'
                    >
                      movbe58@gmail.com
                    </a>
                  </p>
                </div>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setShowFullPrivacy(!showFullPrivacy)}
                className='h-8 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0'
              >
                {showFullPrivacy ? (
                  <>
                    <ChevronUp className='h-4 w-4 mr-1' /> Ocultar detalle
                  </>
                ) : (
                  <>
                    <ChevronDown className='h-4 w-4 mr-1' /> Ver detalle
                  </>
                )}
              </Button>
            </div>

            {/* Texto íntegro del aviso */}
            {showFullPrivacy && (
              <div className='text-xs leading-relaxed text-muted-foreground space-y-3.5 pt-2 border-t max-h-72 overflow-y-auto pr-2 rounded'>
                <div>
                  <strong className='text-foreground block mb-0.5'>¿Qué información recopilamos?</strong>
                  <p>
                    Recopilamos tu nombre, dirección de correo electrónico y las respuestas que
                    proporciones al completar este formulario.
                  </p>
                </div>

                <div>
                  <strong className='text-foreground block mb-0.5'>¿Para qué utilizamos tus datos?</strong>
                  <p className='mb-1'>Utilizaremos tus datos personales para:</p>
                  <ul className='list-disc list-inside space-y-0.5 ml-2'>
                    <li>Gestionar tu inscripción en la lista de espera de Rompehielo.</li>
                    <li>Contactarte sobre la versión Beta, su disponibilidad y el acceso anticipado.</li>
                    <li>
                      Enviarte novedades, actualizaciones y comunicaciones promocionales si has dado tu
                      consentimiento para recibirlas.
                    </li>
                    <li>
                      Analizar las respuestas para comprender las necesidades de los usuarios y mejorar
                      Rompehielo.
                    </li>
                  </ul>
                </div>

                <div>
                  <strong className='text-foreground block mb-0.5'>¿Cómo protegemos tu información?</strong>
                  <p>
                    Movbe adoptará medidas razonables para proteger tus datos personales frente al
                    acceso, uso, divulgación o pérdida no autorizados. El acceso a esta información
                    estará limitado a las personas y proveedores que necesiten utilizarla para las
                    finalidades descritas.
                  </p>
                </div>

                <div>
                  <strong className='text-foreground block mb-0.5'>¿Compartiremos tus datos personales?</strong>
                  <p>
                    Movbe no venderá tus datos personales. Podremos utilizar proveedores tecnológicos
                    para gestionar el formulario, almacenar información o enviar correos electrónicos,
                    de acuerdo con las condiciones y garantías de privacidad aplicables.
                  </p>
                </div>

                <div>
                  <strong className='text-foreground block mb-0.5'>
                    ¿Durante cuánto tiempo conservaremos tus datos?
                  </strong>
                  <p>
                    Conservaremos tus datos durante el tiempo necesario para gestionar la lista de
                    espera y cumplir las finalidades descritas, salvo que la legislación aplicable
                    exija o permita un período diferente.
                  </p>
                </div>

                <div>
                  <strong className='text-foreground block mb-0.5'>¿Cuáles son tus derechos?</strong>
                  <p>
                    Puedes solicitar información sobre el tratamiento de tus datos personales, pedir su
                    actualización o eliminación cuando corresponda, retirar tu consentimiento y
                    ejercer los demás derechos que te reconozca la legislación aplicable.
                  </p>
                  <p className='mt-1'>
                    Para realizar una solicitud relacionada con tus datos personales, escribe a{' '}
                    <a href='mailto:movbe58@gmail.com' className='text-primary hover:underline'>
                      movbe58@gmail.com
                    </a>.
                  </p>
                </div>
              </div>
            )}

            {/* Checkboxes de consentimiento */}
            <div className='space-y-4 pt-2 border-t'>
              {/* Checkbox Obligatorio */}
              <div
                className={`p-3 rounded-lg border transition-colors ${
                  privacyError
                    ? 'border-destructive bg-destructive/5'
                    : 'border-border/60 bg-background/50 hover:bg-background'
                }`}
              >
                <div className='flex items-start space-x-3'>
                  <Checkbox
                    id='privacy-accept'
                    checked={privacyAccepted}
                    onCheckedChange={checked => {
                      setPrivacyAccepted(Boolean(checked))
                      if (checked) setPrivacyError(false)
                    }}
                    disabled={isSubmitting}
                    className='mt-1'
                  />
                  <div className='space-y-1'>
                    <Label
                      htmlFor='privacy-accept'
                      className='text-xs sm:text-sm font-medium leading-relaxed cursor-pointer text-foreground'
                    >
                      <span className='font-bold text-destructive mr-1'>*</span>
                      <strong className='underline-offset-2'>Aceptación del aviso de privacidad</strong>{' '}
                      <span className='text-xs font-normal text-muted-foreground'>
                        (Casilla de verificación obligatoria)
                      </span>
                    </Label>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      He leído el aviso de privacidad y entiendo cómo Movbe utilizará mis datos
                      personales para gestionar mi inscripción en la lista de espera de Rompehielo y
                      atender mi solicitud.
                    </p>
                  </div>
                </div>
                {privacyError && (
                  <p className='text-xs font-medium text-destructive mt-2 ml-7'>
                    Debes marcar esta casilla para poder enviar el formulario.
                  </p>
                )}
              </div>

              {/* Checkbox Opcional */}
              <div className='p-3 rounded-lg border border-border/60 bg-background/50 hover:bg-background transition-colors'>
                <div className='flex items-start space-x-3'>
                  <Checkbox
                    id='promotional-consent'
                    checked={promotionalConsent}
                    onCheckedChange={checked => setPromotionalConsent(Boolean(checked))}
                    disabled={isSubmitting}
                    className='mt-1'
                  />
                  <div className='space-y-1'>
                    <Label
                      htmlFor='promotional-consent'
                      className='text-xs sm:text-sm font-medium leading-relaxed cursor-pointer text-foreground'
                    >
                      <strong>Consentimiento para recibir correos promocionales</strong>{' '}
                      <span className='text-xs font-normal text-muted-foreground'>
                        (Casilla de verificación opcional, sin marcar por defecto)
                      </span>
                    </Label>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      Autorizo expresamente a Movbe a utilizar mi correo electrónico para enviarme
                      novedades, actualizaciones, invitaciones a probar nuevas funciones y
                      comunicaciones comerciales o promocionales relacionadas con Rompehielo.
                      Entiendo que puedo retirar mi consentimiento en cualquier momento escribiendo a{' '}
                      <a href='mailto:movbe58@gmail.com' className='text-primary hover:underline'>
                        movbe58@gmail.com
                      </a>{' '}
                      o utilizando el enlace para cancelar la suscripción incluido en los correos
                      electrónicos, cuando corresponda.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contacto adicional para consultas sobre privacidad */}
              <div className='text-xs text-muted-foreground pt-1 flex items-center justify-between flex-wrap gap-2'>
                <span>
                  Contacto para consultas sobre privacidad:{' '}
                  <a
                    href='mailto:movbe58@gmail.com'
                    className='text-primary font-medium hover:underline'
                  >
                    movbe58@gmail.com
                  </a>
                </span>
                <Link
                  href='/privacy'
                  target='_blank'
                  className='text-primary font-medium hover:underline'
                >
                  Ver aviso en pestaña nueva &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Botón de envío */}
          <Button
            type='submit'
            disabled={isSubmitting}
            className='w-full h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-primary via-primary/90 to-primary hover:opacity-95 shadow-lg shadow-primary/20'
          >
            {isSubmitting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2' />
                Procesando inscripción...
              </>
            ) : (
              <>
                <Send className='h-4 w-4 mr-2' />
                Unirme a la lista de espera
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
export default WaitlistForm
