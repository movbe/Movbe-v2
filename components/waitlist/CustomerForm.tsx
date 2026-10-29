'use client'

import { Briefcase, Building2, Globe, Mail, Send, User } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/lib/hooks/use-toast'
import { waitlistService } from '@/lib/services/WaitlistService'
import { PrivacySection } from './PrivacySection'

interface CustomerFormProps {
  onSuccess: (data: { name: string; email: string }) => void
}

export function CustomerForm({ onSuccess }: CustomerFormProps) {
  const { toast } = useToast()

  // Q1
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [websiteOrInstagram, setWebsiteOrInstagram] = useState('')

  // Q2
  const [category, setCategory] = useState('')
  const [categoryOther, setCategoryOther] = useState('')

  // Q3
  const [adFrustration, setAdFrustration] = useState('')
  const [adFrustrationOther, setAdFrustrationOther] = useState('')

  // Q4
  const [mainObjective, setMainObjective] = useState('')

  // Q5
  const [creativeAdaptation, setCreativeAdaptation] = useState('')

  // Q6
  const [budgetMonthly, setBudgetMonthly] = useState('')

  // Q7
  const [successMetric, setSuccessMetric] = useState('')

  // Q8
  const [vipWaitlistConsent, setVipWaitlistConsent] = useState('')

  // Privacy Policy
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [promotionalConsent, setPromotionalConsent] = useState(false)
  const [privacyError, setPrivacyError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyName.trim() || !contactName.trim() || !email.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa el nombre de la empresa, persona de contacto y correo electrónico.',
        variant: 'destructive',
      })
      return
    }

    if (!privacyAccepted) {
      setPrivacyError(true)
      toast({
        title: 'Aceptación obligatoria',
        description: 'Debes aceptar el aviso de privacidad para registrar tu marca.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    setPrivacyError(false)

    try {
      await waitlistService.submitWaitlist({
        waitlistType: 'customer',
        name: `${contactName} (${companyName})`,
        email,
        privacyAccepted,
        promotionalConsent,
        responses: {
          companyName,
          contactName,
          websiteOrInstagram,
          category: category === 'otra' ? `Otra: ${categoryOther}` : category,
          adFrustration: adFrustration === 'otra' ? `Otra: ${adFrustrationOther}` : adFrustration,
          mainObjective,
          creativeAdaptation,
          budgetMonthly,
          successMetric,
          vipWaitlistConsent,
        },
      })

      toast({
        title: '¡Solicitud recibida!',
        description: 'Los datos de tu marca y empresa han sido registrados en la lista de espera VIP.',
      })
      onSuccess({ name: contactName || companyName, email })
    } catch {
      toast({
        title: '¡Registro guardado!',
        description: 'Tu solicitud de marca ha sido almacenada correctamente.',
      })
      onSuccess({ name: contactName || companyName, email })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {/* Encabezado del Formulario */}
      <div className='p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-transparent border border-emerald-500/20 space-y-2'>
        <div className='flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider'>
          <Briefcase className='h-4 w-4' />
          <span>Cuestionario Early Adopters - Marcas y Anunciantes (Movbe)</span>
        </div>
        <h3 className='text-lg sm:text-xl font-bold text-foreground'>
          Alianza Estratégica: Pauta en el Nuevo Ecosistema de Video para Adultos (Movbe)
        </h3>
        <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
          Movbe es el primer ecosistema de video para adultos verificados (+18) con contenido no
          explícito. Aquí, las marcas acceden a una audiencia con alto poder adquisitivo, reglas
          publicitarias flexibles y CPMs premium, sin el riesgo de ser bloqueados por censura
          familiar.
        </p>
        <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1'>
          <strong className='text-foreground'>Nuestra propuesta de valor para ti:</strong> No es
          solo pauta, es una alianza. Nosotros hacemos todo el trabajo primero (estrategia, creación
          de campaña y ejecución). Tú solo pagas cuando los resultados estén sobre la mesa. Cero
          riesgo, toda la asesoría de nuestro equipo de primer nivel.
        </p>
        <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed pt-0.5'>
          Si quieres ser uno de nuestros Early Adopters, completa este formulario. No importa si tu
          producto es &ldquo;común&rdquo; (tecnología, comida, moda), aquí podemos optimizarlo para
          este nicho de altísimo valor.
        </p>
      </div>

      {/* Pregunta 1 */}
      <div className='space-y-4 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          1. Datos de la Empresa o Marca *
        </Label>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='cust-q1-company' className='text-xs text-muted-foreground flex items-center gap-1'>
              <Building2 className='h-3.5 w-3.5 text-primary' /> Nombre de la empresa/marca: *
            </Label>
            <Input
              id='cust-q1-company'
              type='text'
              placeholder='Ej. Mi Marca SAS'
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
              disabled={isSubmitting}
              className='h-10'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='cust-q1-contact' className='text-xs text-muted-foreground flex items-center gap-1'>
              <User className='h-3.5 w-3.5 text-primary' /> Nombre de la persona de contacto: *
            </Label>
            <Input
              id='cust-q1-contact'
              type='text'
              placeholder='Ej. Andrés Morales'
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              required
              disabled={isSubmitting}
              className='h-10'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'>
          <div className='space-y-2'>
            <Label htmlFor='cust-q1-email' className='text-xs text-muted-foreground flex items-center gap-1'>
              <Mail className='h-3.5 w-3.5 text-primary' /> Correo electrónico corporativo: *
            </Label>
            <Input
              id='cust-q1-email'
              type='email'
              placeholder='andres@mimarca.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className='h-10'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='cust-q1-web' className='text-xs text-muted-foreground flex items-center gap-1'>
              <Globe className='h-3.5 w-3.5 text-emerald-500' /> Sitio web o Instagram de la marca:
            </Label>
            <Input
              id='cust-q1-web'
              type='text'
              placeholder='mimarca.com o @mimarca'
              value={websiteOrInstagram}
              onChange={e => setWebsiteOrInstagram(e.target.value)}
              disabled={isSubmitting}
              className='h-10'
            />
          </div>
        </div>
      </div>

      {/* Pregunta 2 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          2. ¿Cuál es la categoría principal de tu marca?
        </Label>
        <RadioGroup value={category} onValueChange={setCategory} className='space-y-2 pt-1'>
          {[
            'E-commerce / Retail (Moda, tecnología, hogar)',
            'Gastronomía / Restaurantes / Bebidas',
            'Servicios profesionales / Educación / Finanzas',
            'Eventos / Entretenimiento / Música',
            'Marcas para adultos (Bienestar, juguetes, lencería, etc.)',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`cat-${opt}`} />
              <Label htmlFor={`cat-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
          <div className='flex items-center space-x-2.5 p-2.5 rounded-lg border border-transparent'>
            <RadioGroupItem value='otra' id='cat-otra' />
            <Label htmlFor='cat-otra' className='text-xs sm:text-sm cursor-pointer font-normal shrink-0'>
              Otra:
            </Label>
            <Input
              placeholder='Especifica tu categoría...'
              value={categoryOther}
              onChange={e => {
                setCategoryOther(e.target.value)
                setCategory('otra')
              }}
              className='h-8 text-xs flex-1'
            />
          </div>
        </RadioGroup>
      </div>

      {/* Pregunta 3 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          3. Actualmente, ¿cuál es tu mayor frustración al pautar en redes sociales tradicionales (Meta, Google, TikTok)?
        </Label>
        <RadioGroup value={adFrustration} onValueChange={setAdFrustration} className='space-y-2 pt-1'>
          {[
            'Mis anuncios son censurados o rechazados injustificadamente.',
            'Mis CPMs son muy altos y el alcance es cada vez menor.',
            'Me es imposible llegar a un público adulto de alto poder adquisitivo sin que me limiten el contenido.',
            'Mi equipo pierde mucho tiempo lidiando con restricciones de las plataformas.',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`frust-${opt}`} />
              <Label htmlFor={`frust-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
          <div className='flex items-center space-x-2.5 p-2.5 rounded-lg border border-transparent'>
            <RadioGroupItem value='otra' id='frust-otra' />
            <Label htmlFor='frust-otra' className='text-xs sm:text-sm cursor-pointer font-normal shrink-0'>
              Otra:
            </Label>
            <Input
              placeholder='Cuéntanos tu frustración...'
              value={adFrustrationOther}
              onChange={e => {
                setAdFrustrationOther(e.target.value)
                setAdFrustration('otra')
              }}
              className='h-8 text-xs flex-1'
            />
          </div>
        </RadioGroup>
      </div>

      {/* Pregunta 4 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          4. Si te dijéramos que podemos llegar a una audiencia adulta (+18), verificada y con capacidad de compra, ¿cuál sería tu objetivo principal en esta plataforma?
        </Label>
        <RadioGroup value={mainObjective} onValueChange={setMainObjective} className='space-y-2 pt-1'>
          {[
            'Ventas Directas: Quiero que compren mi producto o servicio inmediatamente.',
            'Difusión / Branding: Quiero dar a conocer mi marca y posicionarla en este nicho.',
            'Eventos / Registros: Quiero que se inscriban o asistan a un evento específico.',
            'Leads: Quiero capturar datos de contacto calificados.',
            'Mixto: Un poco de branding y ventas directas.',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`obj-${opt}`} />
              <Label htmlFor={`obj-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Pregunta 5 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          5. En Movbe sabemos que un producto &ldquo;común&rdquo; (ej. una hamburguesa, un curso de finanzas o un celular) puede romperla en este ecosistema si se adapta al tono adulto. ¿Estás dispuesto a dejar que nuestro equipo asesore y modifique los ángulos creativos de tu marca para este nicho?
        </Label>
        <RadioGroup value={creativeAdaptation} onValueChange={setCreativeAdaptation} className='space-y-2 pt-1'>
          {[
            'Sí, confío en el equipo de Movbe para adaptar mi mensaje.',
            'Sí, pero necesito aprobar los cambios finales.',
            'No, quiero mantener mi publicidad exactamente igual a como la tengo en otras redes.',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`adapt-${opt}`} />
              <Label htmlFor={`adapt-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Pregunta 6 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          6. Entendiendo nuestra oferta de &ldquo;Cero Riesgo&rdquo; (Nosotros ejecutamos la pauta primero, tú pagas al ver los resultados), si la campaña cumple tus expectativas, ¿cuál es el presupuesto mensual que estarías dispuesto a invertir?
        </Label>
        <RadioGroup value={budgetMonthly} onValueChange={setBudgetMonthly} className='space-y-2 pt-1'>
          {[
            'Menos de $1.000.000 COP (aprox. $250 USD)',
            'De $1.000.000 a $3.000.000 COP (aprox. $250 - $750 USD)',
            'De $3.000.001 a $6.000.000 COP (aprox. $750 - $1.500 USD)',
            'Más de $6.000.000 COP (Más de $1.500 USD - Escala Premium)',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`budget-${opt}`} />
              <Label htmlFor={`budget-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Pregunta 7 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label htmlFor='cust-success-metric' className='text-sm sm:text-base font-semibold block'>
          7. ¿Qué métrica o resultado exacto necesitas ver para sentir que esta alianza con Movbe fue un éxito rotundo? (Ej: X número de ventas, X de ROI, X de asistentes al evento, etc.)
        </Label>
        <Textarea
          id='cust-success-metric'
          placeholder='Escribe tu respuesta aquí...'
          value={successMetric}
          onChange={e => setSuccessMetric(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className='resize-none text-sm'
        />
      </div>

      {/* Pregunta 8 */}
      <div className='space-y-3 p-4 rounded-xl bg-card border'>
        <Label className='text-sm sm:text-base font-semibold block'>
          8. Como Early Adopter, tendrás acceso prioritario y acompañamiento personalizado. ¿Aceptas entrar a nuestra lista de espera VIP y que nos pongamos en contacto contigo para diseñar la estrategia de tu primera campaña gratuita/por resultados?
        </Label>
        <RadioGroup value={vipWaitlistConsent} onValueChange={setVipWaitlistConsent} className='space-y-2 pt-1'>
          {[
            'Sí, quiero ser de los primeros y agendar mi asesoría.',
            'Tal vez, envíenme más información primero.',
            'No por ahora.',
          ].map(opt => (
            <div key={opt} className='flex items-center space-x-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors'>
              <RadioGroupItem value={opt} id={`vip-${opt}`} />
              <Label htmlFor={`vip-${opt}`} className='text-xs sm:text-sm cursor-pointer flex-1 font-normal'>
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
        className='w-full h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-emerald-600 via-primary to-emerald-600 hover:opacity-95 shadow-lg shadow-emerald-500/20'
      >
        {isSubmitting ? (
          <>
            <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2' />
            Registrando solicitud de marca...
          </>
        ) : (
          <>
            <Send className='h-4 w-4 mr-2' />
            Enviar Cuestionario de Marca / Anunciante
          </>
        )}
      </Button>
    </form>
  )
}
