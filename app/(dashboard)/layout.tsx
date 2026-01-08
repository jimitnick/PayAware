import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const idx = Math.floor(Math.random() * 100);
    const image_url = `https://avatar.iran.liara.run/public/${idx}`;

    return (
        <div className="flex min-h-screen bg-muted/20">
            <Sidebar
                userEmail={user?.email}
                // userAvatarUrl={user?.user_metadata?.avatar_url}
                userAvatarUrl={image_url}
            />
            <main className="flex-1 md:pl-64 min-h-screen transition-all duration-300 ease-in-out">
                {children}
            </main>
        </div>
    )
}
