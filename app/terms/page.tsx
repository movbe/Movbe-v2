'use client'

import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
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
            <CardTitle className='text-2xl sm:text-3xl'>Términos y Condiciones</CardTitle>
            <p className='text-muted-foreground'>
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </CardHeader>

          <CardContent className='space-y-6 text-sm sm:text-base'>
            <section>
              <h2 className='text-xl font-semibold mb-3'>1. Aceptación de los Términos</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Al acceder y utilizar Movbe, usted acepta estar sujeto a estos Términos y
                Condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no
                debe utilizar nuestro servicio.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>2. Descripción del Servicio</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Movbe es una plataforma de compartición de videos que permite a los usuarios cargar,
                ver, compartir y comentar contenido de video. Nos reservamos el derecho de modificar
                o discontinuar el servicio en cualquier momento.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>3. Registro de Cuenta</h2>
              <div className='text-muted-foreground leading-relaxed space-y-2'>
                <p>
                  Para utilizar ciertas funciones del servicio, debe registrar una cuenta. Al
                  registrarse, usted se compromete a:
                </p>
                <ul className='list-disc list-inside space-y-1 ml-4'>
                  <li>Proporcionar información precisa y completa</li>
                  <li>Mantener la seguridad de su contraseña</li>
                  <li>Actualizar su información cuando sea necesario</li>
                  <li>Ser responsable de toda actividad en su cuenta</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>4. Contenido del Usuario</h2>
              <div className='text-muted-foreground leading-relaxed space-y-2'>
                <p>Al cargar contenido a Movbe, usted declara que:</p>
                <ul className='list-disc list-inside space-y-1 ml-4'>
                  <li>Es el propietario del contenido o tiene los derechos necesarios</li>
                  <li>El contenido no infringe derechos de terceros</li>
                  <li>El contenido cumple con nuestras políticas comunitarias</li>
                  <li>No contiene material ilegal, difamatorio o dañino</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>5. Conducta Prohibida</h2>
              <div className='text-muted-foreground leading-relaxed space-y-2'>
                <p>Los usuarios no pueden:</p>
                <ul className='list-disc list-inside space-y-1 ml-4'>
                  <li>Cargar contenido que viole derechos de autor</li>
                  <li>Acosar, intimidar o amenazar a otros usuarios</li>
                  <li>Usar el servicio para actividades ilegales</li>
                  <li>Intentar acceder a cuentas de otros usuarios</li>
                  <li>Distribuir virus o código malicioso</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>6. Privacidad</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Su privacidad es importante para nosotros. Recopilamos y utilizamos su información
                personal de acuerdo con nuestra Política de Privacidad, que forma parte integral de
                estos términos.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>7. Propiedad Intelectual</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Movbe y su contenido original, características y funcionalidad son propiedad de
                Movbe y están protegidos por derechos de autor, marcas comerciales y otras leyes de
                propiedad intelectual.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>8. Limitación de Responsabilidad</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Movbe no será responsable por daños indirectos, incidentales, especiales o
                consecuentes que resulten del uso o la imposibilidad de usar el servicio, incluso si
                hemos sido advertidos de la posibilidad de tales daños.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>9. Modificaciones</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Las
                modificaciones serán efectivas inmediatamente después de su publicación. Su uso
                continuado del servicio constituye su aceptación de los términos modificados.
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>10. Contacto</h2>
              <p className='text-muted-foreground leading-relaxed'>
                Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos en:
                <br />
                <span className='font-medium'>Email:</span> legal@movbe.com
                <br />
                <span className='font-medium'>Teléfono:</span> +1 (555) 123-4567
              </p>
            </section>

            <section>
              <h2 className='text-xl font-semibold mb-3'>
                11. Aviso de privacidad y tratamiento de datos personales
              </h2>
              <div className='text-muted-foreground leading-relaxed space-y-4'>
                <p>
                  <span className='font-semibold text-foreground'>Responsable del tratamiento:</span>{' '}
                  Movbe
                  <br />
                  <span className='font-semibold text-foreground'>Correo electrónico de contacto:</span>{' '}
                  <a href='mailto:movbe58@gmail.com' className='text-primary hover:underline'>
                    movbe58@gmail.com
                  </a>
                </p>

                <div>
                  <h3 className='font-semibold text-foreground mb-1'>¿Qué información recopilamos?</h3>
                  <p>
                    Recopilamos tu nombre, dirección de correo electrónico y las respuestas que
                    proporciones al completar este formulario.
                  </p>
                </div>

                <div>
                  <h3 className='font-semibold text-foreground mb-1'>¿Para qué utilizamos tus datos?</h3>
                  <p className='mb-2'>Utilizaremos tus datos personales para:</p>
                  <ul className='list-disc list-inside space-y-1 ml-4'>
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
                  <h3 className='font-semibold text-foreground mb-1'>¿Cómo protegemos tu información?</h3>
                  <p>
                    Movbe adoptará medidas razonables para proteger tus datos personales frente al
                    acceso, uso, divulgación o pérdida no autorizados. El acceso a esta información
                    estará limitado a las personas y proveedores que necesiten utilizarla para las
                    finalidades descritas.
                  </p>
                </div>

                <div>
                  <h3 className='font-semibold text-foreground mb-1'>¿Compartiremos tus datos personales?</h3>
                  <p>
                    Movbe no venderá tus datos personales. Podremos utilizar proveedores tecnológicos
                    para gestionar el formulario, almacenar información o enviar correos electrónicos,
                    de acuerdo con las condiciones y garantías de privacidad aplicables.
                  </p>
                </div>

                <div>
                  <h3 className='font-semibold text-foreground mb-1'>
                    ¿Durante cuánto tiempo conservaremos tus datos?
                  </h3>
                  <p>
                    Conservaremos tus datos durante el tiempo necesario para gestionar la lista de
                    espera y cumplir las finalidades descritas, salvo que la legislación aplicable
                    exija o permita un período diferente.
                  </p>
                </div>

                <div>
                  <h3 className='font-semibold text-foreground mb-1'>¿Cuáles son tus derechos?</h3>
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

                <div className='bg-muted/40 p-4 rounded-lg space-y-3 border'>
                  <h4 className='font-semibold text-foreground text-sm'>
                    Aceptaciones y Consentimientos en formularios
                  </h4>
                  <div className='space-y-2 text-xs sm:text-sm'>
                    <div>
                      <span className='font-medium text-foreground'>Aceptación del aviso de privacidad:</span>{' '}
                      <span className='text-muted-foreground'>(Casilla obligatoria)</span>
                      <p className='italic mt-0.5 text-muted-foreground'>
                        &ldquo;He leído el aviso de privacidad y entiendo cómo Movbe utilizará mis datos
                        personales para gestionar mi inscripción en la lista de espera de Rompehielo y
                        atender mi solicitud.&rdquo;
                      </p>
                    </div>
                    <div>
                      <span className='font-medium text-foreground'>
                        Consentimiento para recibir correos promocionales:
                      </span>{' '}
                      <span className='text-muted-foreground'>(Casilla opcional, sin marcar por defecto)</span>
                      <p className='italic mt-0.5 text-muted-foreground'>
                        &ldquo;Autorizo expresamente a Movbe a utilizar mi correo electrónico para
                        enviarme novedades, actualizaciones, invitaciones a probar nuevas funciones y
                        comunicaciones comerciales o promocionales relacionadas con Rompehielo. Entiendo
                        que puedo retirar mi consentimiento en cualquier momento escribiendo a
                        movbe58@gmail.com o utilizando el enlace para cancelar la suscripción incluido en
                        los correos electrónicos, cuando corresponda.&rdquo;
                      </p>
                    </div>
                    <div className='pt-1'>
                      <span className='font-medium text-foreground'>
                        Contacto para consultas sobre privacidad:
                      </span>{' '}
                      <a href='mailto:movbe58@gmail.com' className='text-primary hover:underline'>
                        movbe58@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className='pt-6 border-t'>
              <p className='text-center text-xs text-muted-foreground'>
                © 2024 Movbe. Todos los derechos reservados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
