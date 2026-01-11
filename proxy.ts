
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export default async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    if (pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }
    // Protect Dashboard routes
    if (pathname.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Protect Payments routes
    if (pathname.startsWith('/payments') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Protect Insights routes
    if (pathname.startsWith('/insights') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Protect Updates routes
    if (pathname.startsWith('/updates') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if authenticated user needs onboarding
    if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/payments') || pathname.startsWith('/insights') || pathname.startsWith('/updates'))) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
            .from('users')
            .select('onboarding_completed')
            .eq('user_id', user.id)
            .single()

        if (!profile?.onboarding_completed) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }
    }

    // Redirect authenticated users away from auth pages (except onboarding)
    if ((pathname.startsWith('/login') || pathname.startsWith('/signup')) && user) {
        // Check if user has completed onboarding first
        const { data: profile } = await supabase
            .from('users')
            .select('onboarding_completed')
            .eq('user_id', user.id)
            .single()

        if (!profile?.onboarding_completed) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
