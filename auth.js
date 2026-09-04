/**
 * KAZO Authentication
 * Supabase Auth + email OTP verification + numeric public ID login.
 */
(() => {
    const $ = (id) => document.getElementById(id);
    let sb = null;
    let pendingSignupEmail = '';

    const configReady = () => {
        const url = window.KAZO_SUPABASE_URL || '';
        const key = window.KAZO_SUPABASE_PUBLISHABLE_KEY || '';
        return url.startsWith('https://') && !url.includes('YOUR_PROJECT_REF') && key && !key.includes('YOUR_SUPABASE');
    };

    function message(text, type = 'info') {
        const el = $('auth-message');
        if (!el) return;
        const classes = {
            info: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
            success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
            error: 'border-red-500/40 bg-red-500/10 text-red-200',
            warning: 'border-amber-500/40 bg-amber-500/10 text-amber-200'
        };
        el.className = `mt-4 rounded-xl border px-3 py-2.5 text-xs leading-6 ${classes[type] || classes.info}`;
        el.textContent = text;
        el.classList.remove('hidden');
    }

    function clearMessage() {
        const el = $('auth-message');
        if (el) el.classList.add('hidden');
    }

    function setBusy(button, busy, busyText = 'جاري التنفيذ...') {
        if (!button) return;
        if (busy) {
            button.dataset.oldText = button.textContent;
            button.textContent = busyText;
            button.disabled = true;
            button.classList.add('opacity-60', 'cursor-not-allowed');
        } else {
            button.textContent = button.dataset.oldText || button.textContent;
            button.disabled = false;
            button.classList.remove('opacity-60', 'cursor-not-allowed');
        }
    }

    function showPanel(name) {
        clearMessage();
        ['login', 'signup', 'forgot', 'recovery'].forEach(p => {
            const el = $(`auth-${p}-panel`);
            if (el) el.classList.toggle('hidden', p !== name);
        });
        document.querySelectorAll('[data-auth-tab]').forEach(btn => {
            const active = btn.dataset.authTab === name;
            btn.classList.toggle('bg-cyan-500', active);
            btn.classList.toggle('text-slate-950', active);
            btn.classList.toggle('text-slate-300', !active);
            btn.classList.toggle('bg-slate-800', !active);
        });
    }

    async function loadProfile(user) {
        const { data } = await sb
            .from('profiles')
            .select('public_id, name, email')
            .eq('id', user.id)
            .maybeSingle();
        return data || null;
    }

    async function unlock(session) {
        if (!session?.user) return;
        const profile = await loadProfile(session.user);
        window.kazoCurrentUser = session.user;
        window.kazoCurrentProfile = profile;
        document.body.classList.remove('auth-locked');
        $('auth-gate')?.classList.add('hidden');
        if ($('header-user-name')) $('header-user-name').textContent = profile?.name || session.user.user_metadata?.name || 'مستخدم';
        if ($('header-user-id')) $('header-user-id').textContent = profile?.public_id ? `ID ${profile.public_id}` : 'ID ...';
        document.dispatchEvent(new CustomEvent('kazo:auth-ready', { detail: { user: session.user, profile } }));
    }

    async function signIn(identifier, password) {
        const value = identifier.trim();
        if (!value || !password) throw new Error('أدخل البريد أو ID وكلمة المرور.');

        if (value.includes('@')) {
            const { data, error } = await sb.auth.signInWithPassword({ email: value, password });
            if (error) throw error;
            return data.session;
        }

        if (!/^\d+$/.test(value)) throw new Error('الـ ID يجب أن يكون أرقامًا فقط.');

        const response = await fetch(`${window.KAZO_SUPABASE_URL}/functions/v1/login-by-id`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': window.KAZO_SUPABASE_PUBLISHABLE_KEY,
                'Authorization': `Bearer ${window.KAZO_SUPABASE_PUBLISHABLE_KEY}`
            },
            body: JSON.stringify({ public_id: Number(value), password })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.session) throw new Error(result.error || 'تعذر تسجيل الدخول بواسطة ID.');

        const { data, error } = await sb.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token
        });
        if (error) throw error;
        return data.session;
    }

    async function handleLogin(e) {
        e.preventDefault();
        const btn = $('login-submit');
        setBusy(btn, true, 'جاري تسجيل الدخول...');
        clearMessage();
        try {
            const session = await signIn($('login-identifier').value, $('login-password').value);
            await unlock(session);
        } catch (err) {
            message(err.message === 'Invalid login credentials' ? 'البريد/ID أو كلمة المرور غير صحيحة.' : err.message, 'error');
        } finally {
            setBusy(btn, false);
        }
    }

    async function handleSendSignupCode() {
        const name = $('signup-name').value.trim();
        const email = $('signup-email').value.trim().toLowerCase();
        const password = $('signup-password').value;
        if (name.length < 2) return message('اكتب اسمًا لا يقل عن حرفين.', 'warning');
        if (!email.includes('@')) return message('اكتب بريدًا إلكترونيًا صحيحًا.', 'warning');
        if (password.length < 8) return message('كلمة المرور يجب أن تكون 8 أحرف على الأقل.', 'warning');

        const btn = $('signup-send-code');
        setBusy(btn, true, 'جاري إرسال الرمز...');
        try {
            const { error } = await sb.auth.signUp({
                email,
                password,
                options: { data: { name } }
            });
            if (error) throw error;
            pendingSignupEmail = email;
            $('signup-code-wrap').classList.remove('hidden');
            $('signup-create').classList.remove('hidden');
            message('تم إرسال رمز التحقق إلى بريدك. أدخل الرمز المكوّن من 6 أرقام ثم اضغط إنشاء الحساب.', 'success');
        } catch (err) {
            message(err.message, 'error');
        } finally {
            setBusy(btn, false);
        }
    }

    async function handleVerifySignup(e) {
        e.preventDefault();
        const email = pendingSignupEmail || $('signup-email').value.trim().toLowerCase();
        const token = $('signup-code').value.trim();
        if (!/^\d{6}$/.test(token)) return message('أدخل رمز التحقق المكوّن من 6 أرقام.', 'warning');
        const btn = $('signup-create');
        setBusy(btn, true, 'جاري إنشاء الحساب...');
        try {
            const { data, error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
            if (error) throw error;
            if (!data.session) throw new Error('تم التحقق، لكن لم يتم إنشاء جلسة دخول. حاول تسجيل الدخول.');
            message('تم إنشاء الحساب وتأكيد البريد بنجاح.', 'success');
            await unlock(data.session);
        } catch (err) {
            message(err.message, 'error');
        } finally {
            setBusy(btn, false);
        }
    }

    async function handleForgot(e) {
        e.preventDefault();
        const email = $('forgot-email').value.trim().toLowerCase();
        if (!email.includes('@')) return message('أدخل بريد الحساب الصحيح.', 'warning');
        const btn = $('forgot-submit');
        setBusy(btn, true, 'جاري الإرسال...');
        try {
            // رابط الإنتاج ثابت حتى لا يتم إرسال المستخدم إلى localhost عند فتح رسالة الاستعادة.
            const redirectTo = 'https://labw0.github.io/kazo/';
            const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
            if (error) throw error;
            message('إذا كان البريد مسجلاً فستصلك رسالة إعادة تعيين كلمة المرور.', 'success');
        } catch (err) {
            message(err.message, 'error');
        } finally {
            setBusy(btn, false);
        }
    }

    async function handleRecovery(e) {
        e.preventDefault();
        const p1 = $('recovery-password').value;
        const p2 = $('recovery-password-confirm').value;
        if (p1.length < 8) return message('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.', 'warning');
        if (p1 !== p2) return message('كلمتا المرور غير متطابقتين.', 'warning');
        const btn = $('recovery-submit');
        setBusy(btn, true, 'جاري الحفظ...');
        try {
            const { error } = await sb.auth.updateUser({ password: p1 });
            if (error) throw error;
            message('تم تغيير كلمة المرور بنجاح.', 'success');
            const { data } = await sb.auth.getSession();
            await unlock(data.session);
        } catch (err) {
            message(err.message, 'error');
        } finally {
            setBusy(btn, false);
        }
    }

    async function init() {
        if (!configReady()) {
            message('المشروع جاهز، لكن يجب وضع SUPABASE URL و Publishable Key داخل ملف supabase-config.js أولاً.', 'warning');
            return;
        }

        sb = window.supabase.createClient(window.KAZO_SUPABASE_URL, window.KAZO_SUPABASE_PUBLISHABLE_KEY, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
        window.kazoSupabase = sb;

        document.querySelectorAll('[data-auth-tab]').forEach(btn => btn.addEventListener('click', () => showPanel(btn.dataset.authTab)));
        $('login-form')?.addEventListener('submit', handleLogin);
        $('signup-send-code')?.addEventListener('click', handleSendSignupCode);
        $('signup-form')?.addEventListener('submit', handleVerifySignup);
        $('forgot-form')?.addEventListener('submit', handleForgot);
        $('recovery-form')?.addEventListener('submit', handleRecovery);
        $('forgot-link')?.addEventListener('click', () => showPanel('forgot'));
        $('forgot-back')?.addEventListener('click', () => showPanel('login'));
        $('kazo-logout')?.addEventListener('click', async () => { await sb.auth.signOut(); location.reload(); });

        sb.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                $('auth-gate')?.classList.remove('hidden');
                document.body.classList.add('auth-locked');
                showPanel('recovery');
                return;
            }
            if (event === 'SIGNED_OUT') {
                document.body.classList.add('auth-locked');
                $('auth-gate')?.classList.remove('hidden');
                showPanel('login');
            }
        });

        // لا نفتح التطبيق مباشرة إذا كان الرابط خاصًا باستعادة كلمة المرور.
        // Supabase قد يضع type=recovery في الـ hash، أو code في query حسب نوع التدفق.
        const isRecoveryUrl =
            location.hash.includes('type=recovery') ||
            new URLSearchParams(location.search).has('code');

        const { data } = await sb.auth.getSession();
        if (isRecoveryUrl) {
            document.body.classList.add('auth-locked');
            $('auth-gate')?.classList.remove('hidden');
            showPanel('recovery');
        } else if (data.session) {
            await unlock(data.session);
        } else {
            showPanel('login');
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
