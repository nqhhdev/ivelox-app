import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLoginForm } from '../hooks/useLoginForm'
import { SocialButton } from '../components/SocialButton'
import { OrDivider } from '../components/OrDivider'
import { PasswordInput } from '../components/PasswordInput'
import { LogoMark } from '@/shared/ui/LogoMark'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { tokens } from '@/shared/ui/tokens'

export function LoginPage() {
  return <LoginV3 />
}

// ── Email+password form (dark) ──────────────────────────────────────────────
function EmailForm() {
  const { t } = useTranslation()
  const { form, onSubmit, onGoogle } = useLoginForm()
  const { register, formState: { errors, isSubmitting } } = form

  const inputStyle = (err?: boolean): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px', borderRadius: 12,
    border: `1.5px solid ${err ? tokens.danger : 'rgba(255,255,255,0.12)'}`,
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontFamily: tokens.font, fontSize: 14, outline: 'none',
  })

  return (
    <div>
      <SocialButton onClick={onGoogle} loading={isSubmitting} dark />
      <div style={{ margin: '20px 0' }}><OrDivider dark /></div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            style={inputStyle(!!errors.email)}
          />
          {errors.email && <p style={{ fontSize: 12, color: tokens.danger, marginTop: 4 }}>{t(`auth.errors.${errors.email.message}`)}</p>}
        </div>
        <div>
          <PasswordInput
            registration={register('password')}
            placeholder="••••••••"
            hasError={!!errors.password}
            style={inputStyle(!!errors.password)}
          />
          {errors.password && <p style={{ fontSize: 12, color: tokens.danger, marginTop: 4 }}>{t(`auth.errors.${errors.password.message}`)}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Link to="/forgot-password" style={{ fontSize: 12, color: '#c084fc', fontWeight: 600, textDecoration: 'none' }}>
              {t('auth.login.forgotPassword')}
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '14px 18px', marginTop: 2,
            background: 'linear-gradient(135deg, #aa3bff, #6d28d9)',
            color: '#fff', border: 'none', borderRadius: 12,
            fontFamily: tokens.font, fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 12px 32px rgba(170,59,255,0.40)',
            opacity: isSubmitting ? 0.7 : 1,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {isSubmitting ? t('common.loading') : t('auth.login.gameCta')}
          {!isSubmitting && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
    </div>
  )
}

// ── V3: Dark game-y full-bleed (matches design) ────────────────────────────
function LoginV3() {
  const { t } = useTranslation()

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#05030d',
      fontFamily: tokens.font, color: '#fff',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>

      {/* Aurora layers */}
      <div style={{ position: 'absolute', top: -200, left: -200, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(170,59,255,0.55), transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', right: -300, width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,217,255,0.30), transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -250, left: '30%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.22), transparent 65%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '15%', right: '20%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.18), transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Mesh gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 30%, rgba(109,40,217,0.35) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(0,217,255,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />

      {/* Tech grid */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.20, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="grid-fade-v" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00d9ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#aa3bff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00d9ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="grid-fade-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#aa3bff" stopOpacity="0" />
            <stop offset="50%" stopColor="#aa3bff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#aa3bff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
          <line key={`h${i}`} x1="0" y1={80 + i * 80} x2="100%" y2={80 + i * 80} stroke="url(#grid-fade-h)" strokeWidth="0.6" />
        ))}
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(i => (
          <line key={`v${i}`} x1={`${(i / 18) * 100}%`} y1="0" x2={`${(i / 18) * 100}%`} y2="100%" stroke="url(#grid-fade-v)" strokeWidth="0.6" />
        ))}
      </svg>

      {/* Star field */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 80 }).map((_, i) => {
          const x = ((i * 137 + 31) % 100)
          const y = ((i * 73 + 19) % 100)
          const r = i % 5 === 0 ? 1.6 : 0.7
          const op = 0.3 + (i % 7) * 0.1
          return <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill="#fff" opacity={op} />
        })}
        {/* Twinkle cross stars */}
        {[
          { x: '10%', y: '24%', c: '#fbbf24' },
          { x: '68%', y: '16%', c: '#00d9ff' },
          { x: '86%', y: '48%', c: '#aa3bff' },
          { x: '22%', y: '72%', c: '#fbbf24' },
          { x: '76%', y: '82%', c: '#00d9ff' },
        ].map((s, i) => (
          <g key={i} transform={`translate(${s.x}, ${s.y})`}>
            <path d="M0 -8 L1.5 -1.5 L8 0 L1.5 1.5 L0 8 L-1.5 1.5 L-8 0 L-1.5 -1.5 Z" fill={s.c} opacity="0.85" />
          </g>
        ))}
      </svg>

      {/* Constellation lines */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.45 }}>
        <defs>
          <linearGradient id="const-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#aa3bff" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        {([
          ['14%','18%','26%','28%'],['26%','28%','18%','42%'],['18%','42%','13%','58%'],
          ['75%','22%','86%','34%'],['86%','34%','82%','48%'],['82%','48%','89%','62%'],
          ['13%','58%','22%','72%'],
        ] as [string,string,string,string][]).map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#const-line)" strokeWidth="1" strokeDasharray="2 6" />
        ))}
        {([
          ['14%','18%'],['26%','28%'],['18%','42%'],['13%','58%'],['22%','72%'],
          ['75%','22%'],['86%','34%'],['82%','48%'],['89%','62%'],
        ] as [string,string][]).map(([x,y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="6" fill="#aa3bff" opacity="0.15" />
            <circle cx={x} cy={y} r="2.5" fill="#00d9ff" />
          </g>
        ))}
      </svg>

      {/* Floating rings */}
      <div style={{ position: 'absolute', top: 60, right: '14%', width: 140, height: 140, borderRadius: '50%', border: '1.5px dashed rgba(0,217,255,0.30)', transform: 'rotate(15deg)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 100, right: 'calc(14% + 40px)', width: 80, height: 80, borderRadius: '50%', border: '1.5px solid rgba(170,59,255,0.35)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 80, left: '7%', width: 160, height: 160, borderRadius: '50%', border: '1.5px dashed rgba(251,191,36,0.25)', pointerEvents: 'none' }} />

      {/* Floating chips */}
      <div style={{ position: 'absolute', top: 80, left: '6%', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 8, transform: 'rotate(-4deg)', boxShadow: '0 16px 40px rgba(0,0,0,0.30)', pointerEvents: 'none' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          🏆
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Just unlocked</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Steady Ear · L7+</div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: '18%', right: '8%', padding: '10px 14px', borderRadius: 12, background: 'linear-gradient(135deg, #fb923c, #ef4444)', display: 'flex', alignItems: 'center', gap: 8, transform: 'rotate(3deg)', boxShadow: '0 12px 32px rgba(239,68,68,0.40), 0 0 0 6px rgba(239,68,68,0.10)', pointerEvents: 'none' }}>
        <span>🔥</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>×5 combo</span>
      </div>

      <div style={{ position: 'absolute', bottom: '12%', left: '14%', padding: '10px 16px', borderRadius: 999, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, transform: 'rotate(-3deg)', boxShadow: '0 8px 24px rgba(251,191,36,0.30)', pointerEvents: 'none' }}>
        <span>⚡</span>
        <span style={{ fontWeight: 800, fontFamily: tokens.mono }}>+248 XP</span>
      </div>

      <div style={{ position: 'absolute', bottom: '18%', right: '6%', padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'rotate(4deg)', boxShadow: '0 16px 40px rgba(170,59,255,0.30)', pointerEvents: 'none' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>BAND</div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1.4, lineHeight: 1, background: 'linear-gradient(135deg, #aa3bff, #00d9ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>7.5</div>
      </div>

      <div style={{ position: 'absolute', top: '38%', left: '10%', padding: '8px 12px', borderRadius: 999, background: 'rgba(0,217,255,0.12)', border: '1px solid rgba(0,217,255,0.30)', display: 'flex', alignItems: 'center', gap: 6, transform: 'rotate(-6deg)', backdropFilter: 'blur(8px)', pointerEvents: 'none' }}>
        <div style={{ width: 6, height: 6, borderRadius: 999, background: '#00d9ff', boxShadow: '0 0 8px #00d9ff' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#00d9ff', fontFamily: tokens.mono, letterSpacing: 0.4 }}>90,128 ONLINE</span>
      </div>

      <div style={{ position: 'absolute', bottom: '38%', right: '11%', padding: '6px 12px', borderRadius: 999, background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.32)', display: 'flex', alignItems: 'center', gap: 6, transform: 'rotate(5deg)', pointerEvents: 'none' }}>
        <span style={{ fontSize: 11, color: '#22c55e' }}>✦</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', letterSpacing: 0.4, textTransform: 'uppercase' }}>NEW MISSION</span>
      </div>

      {/* Skill pills — left edge */}
      <div style={{ position: 'absolute', top: '50%', left: 24, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {[
          { c: '#3b82f6', label: 'R', icon: '📖' },
          { c: '#22c55e', label: 'L', icon: '🎧' },
          { c: '#f59e0b', label: 'W', icon: '✏️' },
          { c: '#aa3bff', label: 'S', icon: '🎙️' },
        ].map((s, i) => (
          <div key={i} style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${s.c}18`, border: `1px solid ${s.c}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', fontSize: 16,
          }}>
            {s.icon}
          </div>
        ))}
      </div>

      {/* Glassmorphism card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 440,
        margin: '0 16px',
        background: 'rgba(15,10,26,0.55)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(28px) saturate(140%)',
        borderRadius: 24, padding: 36,
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(170,59,255,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 1, background: 'linear-gradient(90deg, transparent, rgba(170,59,255,0.6), rgba(0,217,255,0.6), transparent)' }} />

        {/* Card header: logo + language */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <LogoMark />
          <LanguageSwitcher dark />
        </div>

        <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: '#fff' }}>
          {t('auth.login.readyPlayer')}
        </h1>
        <p style={{ margin: '0 0 22px', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
          {t('auth.login.keepXP')}
        </p>

        <EmailForm />

        <div style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          {t('auth.login.newHere')}{' '}
          <Link to="/register" style={{ color: '#aa3bff', fontWeight: 700, textDecoration: 'none' }}>
            {t('auth.login.startJourney')}
          </Link>
        </div>
      </div>
    </div>
  )
}
