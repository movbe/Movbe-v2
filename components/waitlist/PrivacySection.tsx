'use client'

import { ChevronDown, ChevronUp, Shield } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface PrivacySectionProps {
  privacyAccepted: boolean
  onPrivacyChange: (accepted: boolean) => void
  promotionalConsent: boolean
  onPromotionalChange: (consent: boolean) => void
  privacyError: boolean
  disabled?: boolean
}

export function PrivacySection({
  privacyAccepted,
  onPrivacyChange,
  promotionalConsent,
  onPromotionalChange,
  privacyError,
  disabled = false,
}: PrivacySectionProps) {
  const [showFullPrivacy, setShowFullPrivacy] = useState(false)

  return (
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
              id='privacy-accept-check'
              checked={privacyAccepted}
              onCheckedChange={checked => onPrivacyChange(Boolean(checked))}
              disabled={disabled}
              className='mt-1'
            />
            <div className='space-y-1'>
              <Label
                htmlFor='privacy-accept-check'
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
              id='promotional-consent-check'
              checked={promotionalConsent}
              onCheckedChange={checked => onPromotionalChange(Boolean(checked))}
              disabled={disabled}
              className='mt-1'
            />
            <div className='space-y-1'>
              <Label
                htmlFor='promotional-consent-check'
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
            Ver aviso completo en pestaña nueva &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
