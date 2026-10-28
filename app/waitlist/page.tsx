'use client'

import { Sparkles, Users, Bell, Rocket, ShieldCheck } from 'lucide-react'
import HeaderDynamic from '@/components/HeaderDynamic'
import { PageTransition } from '@/components/PageTransition'
import Sidebar from '@/components/Sidebar'
import WaitlistForm from '@/components/WaitlistForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'

export default function WaitlistPage() {
  const dispatch = useAppDispatch()

  return (
    <PageTransition>
      <div className='flex flex-col min-h-screen'>
        <HeaderDynamic onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 pt-16 sm:pt-20'>
          <Sidebar />
          <div className='flex-1 bg-gradient-to-br from-background via-background to-muted/20 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto'>
            <div className='w-full max-w-6xl mx-auto py-4 space-y-8'>
              {/* Header Hero */}
              <div className='text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto'>
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium border border-primary/20'>
                  <Sparkles className='h-3.5 w-3.5' /> Rompehielo Beta &bull; Movbe
                </div>
                <h1 className='text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent'>
                  Inscripción en la Lista de Espera
                </h1>
                <p className='text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed'>
                  Sé de los primeros en probar la versión Beta de Rompehielo. Asegura tu acceso
                  anticipado, ayuda a dar forma a la plataforma y recibe novedades exclusivas antes
                  que nadie.
                </p>
              </div>

              {/* Grid with Form and Info Cards */}
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
                {/* Formulario Principal (col-span-8) */}
                <div className='lg:col-span-8 order-1'>
                  <WaitlistForm />
                </div>

                {/* Columna Lateral con Ventajas y Confianza (col-span-4) */}
                <div className='lg:col-span-4 order-2 space-y-4 sm:space-y-6'>
                  {/* Beneficios */}
                  <Card className='border shadow-md bg-card/60 backdrop-blur-sm'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
                        <Rocket className='h-5 w-5 text-primary' />
                        ¿Qué obtienes con la Beta?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3 text-xs sm:text-sm text-muted-foreground'>
                      <div className='flex gap-2.5 items-start'>
                        <span className='font-bold text-primary'>01.</span>
                        <p>
                          <strong className='text-foreground'>Acceso preferente:</strong> Entrada
                          temprana para explorar y crear contenido en Rompehielo.
                        </p>
                      </div>
                      <div className='flex gap-2.5 items-start'>
                        <span className='font-bold text-primary'>02.</span>
                        <p>
                          <strong className='text-foreground'>Voz en el producto:</strong> Tus
                          comentarios y sugerencias moldearán las funciones clave.
                        </p>
                      </div>
                      <div className='flex gap-2.5 items-start'>
                        <span className='font-bold text-primary'>03.</span>
                        <p>
                          <strong className='text-foreground'>Actualizaciones directas:</strong>{' '}
                          Avisos directos sobre el calendario de despliegue y nuevas capacidades.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Compromiso de Privacidad */}
                  <Card className='border shadow-md bg-gradient-to-br from-primary/5 via-primary/10 to-transparent'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
                        <ShieldCheck className='h-5 w-5 text-primary' />
                        Tu Privacidad Importa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2.5 text-xs sm:text-sm text-muted-foreground'>
                      <p>
                        Movbe protege tus datos personales y nunca los venderá a terceros. Usamos
                        tus datos únicamente para gestionar tu acceso a Rompehielo y mantenerte
                        informado según tus preferencias.
                      </p>
                      <p className='text-xs pt-1'>
                        ¿Tienes dudas? Escríbenos directamente a:{' '}
                        <a
                          href='mailto:movbe58@gmail.com'
                          className='text-primary hover:underline font-medium'
                        >
                          movbe58@gmail.com
                        </a>
                      </p>
                    </CardContent>
                  </Card>

                  {/* Comunidad */}
                  <Card className='border shadow-md bg-card/60 backdrop-blur-sm'>
                    <CardContent className='pt-6 space-y-2 text-center text-xs sm:text-sm text-muted-foreground'>
                      <div className='w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2'>
                        <Users className='h-5 w-5' />
                      </div>
                      <h4 className='font-semibold text-foreground text-sm'>
                        Comunidad en Crecimiento
                      </h4>
                      <p>
                        Diseñado para creadores y espectadores que buscan una experiencia más
                        auténtica y conectada.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
