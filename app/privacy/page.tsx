'use client'

import { ArrowLeft, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className='min-h-screen bg-muted/50 p-4 relative overflow-y-auto mobile-scroll-container ios-scroll-fix'>
      {/* Logo - top left */}
      <Link href='/' className='absolute top-4 left-4 z-10'>
        <Image
          src='/logo_black.png'
          alt='Movbe'
          width={96}
          height={32}
          className='dark:hidden w-24 h-auto'
        />
        <Image
          src='/logo_white.png'
          alt='Movbe'
          width={100}
          height={32}
          className='hidden dark:block w-24 h-auto'
        />
      </Link>

      <div className='max-w-4xl mx-auto'>
        <Card className='relative mt-16'>
          {/* Back arrow - top left of card */}
          <Button
            variant='ghost'
            size='icon'
            className='absolute top-4 left-4 z-10'
            onClick={() => router.back()}
          >
            <ArrowLeft className='h-6 w-6' />
          </Button>

          <CardHeader className='pt-12 text-center'>
            <div className='flex items-center justify-center gap-2 mb-2'>
              <Shield className='h-6 w-6 text-primary' />
              <CardTitle className='text-2xl sm:text-3xl'>
                Aviso de Privacidad y Tratamiento de Datos Personales
              </CardTitle>
            </div>
            <p className='text-muted-foreground'>
              Movbe &bull; Rompehielo &bull; Última actualización:{' '}
              {new Date().toLocaleDateString('es-ES')}
            </p>
          </CardHeader>

          <CardContent className='space-y-6 text-sm sm:text-base'>
            <section className='p-4 rounded-lg bg-primary/5 border border-primary/20'>
              <p className='leading-relaxed'>
                <span className='font-semibold text-foreground'>Responsable del tratamiento:</span>{' '}
                Movbe
                <br />
                <span className='font-semibold text-foreground'>
                  Correo electrónico de contacto:
                </span>{' '}
                <a href='mailto:movbe58@gmail.com' className='text-primary hover:underline font-medium'>
                  movbe58@gmail.com
                </a>
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>¿Qué información recopilamos?</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Recopilamos tu nombre, dirección de correo electrónico y las respuestas que
                proporciones al completar este formulario.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>¿Para qué utilizamos tus datos?</h2>
              <div className='text-muted-foreground leading-relaxed space-y-2'>
                <p>Utilizaremos tus datos personales para:</p>
                <ul className='list-disc list-inside space-y-1.5 ml-4'>
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
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>¿Cómo protegemos tu información?</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Movbe adoptará medidas razonables para proteger tus datos personales frente al
                acceso, uso, divulgación o pérdida no autorizados. El acceso a esta información
                estará limitado a las personas y proveedores que necesiten utilizarla para las
                finalidades descritas.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>¿Compartiremos tus datos personales?</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Movbe no venderá tus datos personales. Podremos utilizar proveedores tecnológicos
                para gestionar el formulario, almacenar información o enviar correos electrónicos, de
                acuerdo con las condiciones y garantías de privacidad aplicables.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>
                ¿Durante cuánto tiempo conservaremos tus datos?
              </h2>
              <p className='text-muted-foreground leading-relaxed'>
                Conservaremos tus datos durante el tiempo necesario para gestionar la lista de espera
                y cumplir las finalidades descritas, salvo que la legislación aplicable exija o
                permita un período diferente.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>¿Cuáles son tus derechos?</h2>
              <p className='text-muted-foreground leading-relaxed mb-3'>
                Puedes solicitar información sobre el tratamiento de tus datos personales, pedir su
                actualización o eliminación cuando corresponda, retirar tu consentimiento y ejercer
                los demás derechos que te reconozca la legislación aplicable.
              </p>
              <p className='text-muted-foreground leading-relaxed'>
                Para realizar una solicitud relacionada con tus datos personales, escribe a:{' '}
                <a href='mailto:movbe58@gmail.com' className='text-primary hover:underline font-medium'>
                  movbe58@gmail.com
                </a>
                .
              </p>
            </section>

            <section className='pt-4 border-t'>
              <h2 className='text-lg font-semibold mb-3'>Términos de Consentimiento en Formularios</h2>
              <div className='space-y-4 text-muted-foreground'>
                <div className='p-3 bg-muted/40 rounded-lg border'>
                  <p className='font-medium text-foreground text-sm'>
                    Aceptación del aviso de privacidad (Obligatoria):
                  </p>
                  <p className='text-xs sm:text-sm italic mt-1'>
                    &ldquo;He leído el aviso de privacidad y entiendo cómo Movbe utilizará mis datos
                    personales para gestionar mi inscripción en la lista de espera de Rompehielo y
                    atender mi solicitud.&rdquo;
                  </p>
                </div>
                <div className='p-3 bg-muted/40 rounded-lg border'>
                  <p className='font-medium text-foreground text-sm'>
                    Consentimiento para recibir correos promocionales (Opcional):
                  </p>
                  <p className='text-xs sm:text-sm italic mt-1'>
                    &ldquo;Autorizo expresamente a Movbe a utilizar mi correo electrónico para
                    enviarme novedades, actualizaciones, invitaciones a probar nuevas funciones y
                    comunicaciones comerciales o promocionales relacionadas con Rompehielo. Entiendo
                    que puedo retirar mi consentimiento en cualquier momento escribiendo a
                    movbe58@gmail.com o utilizando el enlace para cancelar la suscripción incluido en
                    los correos electrónicos, cuando corresponda.&rdquo;
                  </p>
                </div>
              </div>
            </section>

            <div className='pt-6 border-t flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-2'>
              <p>© {new Date().getFullYear()} Movbe. Todos los derechos reservados.</p>
              <Link href='/waitlist' className='text-primary hover:underline'>
                Ir al formulario de lista de espera &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
