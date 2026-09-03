import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { public_id, password } = await req.json()
    if (!Number.isInteger(public_id) || !password) {
      return Response.json({ error: 'بيانات الدخول غير مكتملة.' }, { status: 400, headers: corsHeaders })
    }

    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const admin = createClient(url, service, { auth: { persistSession: false } })
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('email')
      .eq('public_id', public_id)
      .maybeSingle()

    if (profileError || !profile?.email) {
      return Response.json({ error: 'ID أو كلمة المرور غير صحيحة.' }, { status: 401, headers: corsHeaders })
    }

    const client = createClient(url, anon, { auth: { persistSession: false } })
    const { data, error } = await client.auth.signInWithPassword({ email: profile.email, password })
    if (error || !data.session) {
      return Response.json({ error: 'ID أو كلمة المرور غير صحيحة.' }, { status: 401, headers: corsHeaders })
    }

    return Response.json({ session: data.session }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (_err) {
    return Response.json({ error: 'حدث خطأ في تسجيل الدخول.' }, { status: 500, headers: corsHeaders })
  }
})
