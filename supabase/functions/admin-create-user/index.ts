import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const authHeader = req.headers.get('Authorization')!

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || userRole?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: User is not an admin' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    const { role, ...userData } = await req.json()
    if (!role || !['student', 'teacher', 'sme'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid or missing role' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const { email, password, full_name, phone, school_id, batch_id, student_id, teacher_id, specialization, experience_years, bio } = userData

    if ((role === 'student' || role === 'teacher') && (!email || !password || !full_name || !school_id)) {
        return new Response(JSON.stringify({ error: 'Missing required fields for student/teacher' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    } else if (role === 'sme' && (!email || !password || !full_name || !specialization)) {
        return new Response(JSON.stringify({ error: 'Missing required fields for SME' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    })

    if (createError) {
      throw createError
    }

    const newUserId = newUser.user.id

    await supabaseAdmin.from('profiles').insert({
      id: newUserId,
      full_name: full_name,
      email: email,
      phone: phone,
    })

    await supabaseAdmin.from('user_roles').insert({
      user_id: newUserId,
      role: role,
    })

    switch (role) {
      case 'student':
        await supabaseAdmin.from('students').insert({
          id: newUserId,
          student_id: student_id,
          school_id: school_id,
          batch_id: batch_id || null,
          enrollment_date: new Date().toISOString(),
        })
        break
      case 'teacher':
        await supabaseAdmin.from('teachers').insert({
          id: newUserId,
          employee_id: teacher_id,
          school_id: school_id,
          specialization: specialization,
        })
        break
      case 'sme':
        await supabaseAdmin.from('smes').insert({
          id: newUserId,
          specialization: specialization,
          experience_years: experience_years,
          bio: bio,
        })
        break
    }

    return new Response(JSON.stringify({ message: 'User created successfully', userId: newUserId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
