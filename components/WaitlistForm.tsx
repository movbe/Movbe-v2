'use client'

import {
  CheckCircle2,
  Film,
  Info,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreatorForm } from './waitlist/CreatorForm'
import { CustomerForm } from './waitlist/CustomerForm'
import { IcebreakerForm } from './waitlist/IcebreakerForm'

export type WaitlistTabType = 'icebreaker' | 'customer' | 'creator'

interface WaitlistFormProps {
  defaultTab?: WaitlistTabType
}

export function WaitlistForm({ defaultTab = 'icebreaker' }: WaitlistFormProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<WaitlistTabType>(defaultTab)

  // Submitted state
  const [submittedData, setSubmittedData] = useState<{
    name: string
    email: string
    type: WaitlistTabType
  } | null>(null)

  // Read URL query parameter if present (?type=customer, ?type=creator, ?type=icebreaker)
  useEffect(() => {
    const typeParam = searchParams?.get('type') || searchParams?.get('tab')
    if (typeParam === 'icebreaker' || typeParam === 'customer' || typeParam === 'creator') {
      setActiveTab(typeParam)
    }
  }, [searchParams])

  const handleSuccess = (data: { name: string; email: string }) => {
    setSubmittedData({
      ...data,
      type: activeTab,
    })
  }

  const handleReset = () => {
    setSubmittedData(null)
  }

  if (submittedData) {
    const typeLabels: Record<WaitlistTabType, { label: string; desc: string }> = {
      icebreaker: {
        label: 'Pase Rompehielo Social',
        desc: 'Recibirás prioridad por haber llegado a través de nuestras campañas en redes sociales.',
      },
      customer: {
        label: 'Espectador / Cliente Beta',
        desc: 'Serás de los primeros en probar la experiencia de visualización e interacción.',
      },
      creator: {
        label: 'Creador de Contenido & Partner',
        desc: 'Tu canal tendrá acceso preferencial y soporte para creadores en el lanzamiento.',
      },
    }

    return (
      <Card className='w-full max-w-2xl mx-auto border border-primary/20 bg-card/95 shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300'>
        <CardContent className='pt-10 pb-8 px-6 text-center space-y-6'>
          <div className='w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5'>
            <CheckCircle2 className='h-10 w-10 text-primary' />
          </div>

          <div className='space-y-2'>
            <Badge variant='outline' className='bg-primary/5 text-primary border-primary/20 px-3 py-1'>
              <Sparkles className='h-3.5 w-3.5 mr-1.5' /> {typeLabels[submittedData.type].label}
            </Badge>
            <h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>
              ¡Gracias por registrarte, {submittedData.name}!
            </h2>
            <p className='text-muted-foreground max-w-md mx-auto text-sm sm:text-base'>
              Hemos registrado tu solicitud. Te notificaremos a{' '}
              <span className='font-semibold text-foreground'>{submittedData.email}</span> cuando la
              versión Beta y el acceso anticipado de{' '}
              <span className='text-primary font-medium'>Rompehielo</span> estén listos.
            </p>
          </div>

          <div className='p-4 rounded-xl bg-muted/40 border border-muted text-xs sm:text-sm text-muted-foreground text-left space-y-2'>
            <div className='flex items-center gap-2 text-foreground font-medium'>
              <Info className='h-4 w-4 text-primary shrink-0' />
              <span>Resumen de tu registro</span>
            </div>
            <p>
              &bull; <strong className='text-foreground'>Modalidad:</strong>{' '}
              {typeLabels[submittedData.type].label}
            </p>
            <p>
              &bull; <strong className='text-foreground'>Aviso de privacidad:</strong> Aceptado y
              vigente
            </p>
            <p>
              &bull; <strong className='text-foreground'>Contacto de privacidad:</strong>{' '}
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
            <Sparkles className='h-3.5 w-3.5 mr-1.5' /> Acceso Anticipado &bull; Beta Rompehielo
          </Badge>
        </div>
        <CardTitle className='text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text'>
          Únete a la Lista de Espera de Rompehielo
        </CardTitle>
        <CardDescription className='text-sm sm:text-base leading-relaxed'>
          Selecciona la opción que mejor se adapte a ti para completar el formulario correspondiente.
        </CardDescription>

        {/* Tabs de Selección entre los 3 formularios */}
        <div className='pt-2'>
          <Tabs
            value={activeTab}
            onValueChange={val => setActiveTab(val as WaitlistTabType)}
            className='w-full'
          >
            <TabsList className='grid grid-cols-3 w-full h-auto p-1.5 bg-muted/70 rounded-xl gap-1'>
              <TabsTrigger
                value='icebreaker'
                className='flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:text-blue-500 data-[state=active]:shadow-md transition-all'
              >
                <Share2 className='h-4 w-4 shrink-0' />
                <span className='truncate'>Rompehielo Social</span>
              </TabsTrigger>

              <TabsTrigger
                value='customer'
                className='flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:text-emerald-500 data-[state=active]:shadow-md transition-all'
              >
                <Users className='h-4 w-4 shrink-0' />
                <span className='truncate'>Clientes / Público</span>
              </TabsTrigger>

              <TabsTrigger
                value='creator'
                className='flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:text-purple-500 data-[state=active]:shadow-md transition-all'
              >
                <Film className='h-4 w-4 shrink-0' />
                <span className='truncate'>Creadores</span>
              </TabsTrigger>
            </TabsList>

            {/* Contenido Formulario 1: Icebreaker / Social */}
            <TabsContent value='icebreaker' className='mt-6 animate-in fade-in-50 duration-200'>
              <IcebreakerForm onSuccess={handleSuccess} />
            </TabsContent>

            {/* Contenido Formulario 2: Clientes / Espectadores */}
            <TabsContent value='customer' className='mt-6 animate-in fade-in-50 duration-200'>
              <CustomerForm onSuccess={handleSuccess} />
            </TabsContent>

            {/* Contenido Formulario 3: Creadores de Contenido */}
            <TabsContent value='creator' className='mt-6 animate-in fade-in-50 duration-200'>
              <CreatorForm onSuccess={handleSuccess} />
            </TabsContent>
          </Tabs>
        </div>
      </CardHeader>
    </Card>
  )
}

export default WaitlistForm
