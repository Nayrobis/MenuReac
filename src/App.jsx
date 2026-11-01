import { useState, useEffect } from 'react'
import { E, CATS, N, L, P, W, R } from './exercises'

const Icon = ({ children, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
)
const Star = ({ on }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="2">
    <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.2 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
  </svg>
)

function Exercise({ ex }) {
  const [id, cat, title, desc, fields, fn] = ex
  const init = () => Object.fromEntries(fields.map((f) => [f[0], String(f[3])]))
  const [v, setV] = useState(init)
  const [out, setOut] = useState(null)

  const run = () => {
    const p = {}
    for (const [k, , t] of fields) {
      const x = v[k]
      if (t === 'n') {
        p[k] = N(x)
        if (isNaN(p[k])) return setOut('Ingresa valores numéricos válidos')
      } else if (t === 'l' || t === 'p') {
        const a = t === 'l' ? L(x) : P(x)
        if (a.flat().some(isNaN)) return setOut('Solo se permiten números')
        p[k] = a
      } else p[k] = t === 's' ? W(x) : x
    }
    setOut(fn(p))
  }

  return (
    <div className="panel">
      <div className="ph">
        <small>Ejercicio {String(id).padStart(2, '0')} · {cat}</small>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
      <div className="pb">
        {fields.map(([k, label, t]) => (
          <label key={k}>
            {label}
            {t === 'n' || t === 't' ? (
              <input className="f" inputMode={t === 'n' ? 'decimal' : 'text'} value={v[k]}
                onChange={(e) => setV({ ...v, [k]: e.target.value })} />
            ) : (
              <textarea className="f" value={v[k]}
                onChange={(e) => setV({ ...v, [k]: e.target.value })} />
            )}
          </label>
        ))}
        <div className="row">
          <button className="btn" onClick={run}>Calcular</button>
          <button className="btn g" onClick={() => { setV(init()); setOut(null) }}>Reiniciar</button>
        </div>
        {typeof out === 'string' && <div className="err">{out}</div>}
        {Array.isArray(out) && (
          <div className="res">
            {out.map(([a, b], i) => (
              <div key={i}><span>{a}</span><b>{typeof b === 'number' ? R(b, 4) : b}</b></div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const read = () => {
    const m = /^#ej-(\d+)$/.exec(location.hash)
    return m ? +m[1] : null
  }
  const [cur, setCur] = useState(read)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Todos')
  const [fav, setFav] = useState([])

  useEffect(() => {
    const f = () => { setCur(read()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])

  const go = (i) => { location.hash = i ? 'ej-' + i : 'inicio' }
  const ql = q.toLowerCase().trim()
  const list = E.filter((e) =>
    (cat === 'Todos' || (cat === 'Favoritos' ? fav.includes(e[0]) : e[1] === cat)) &&
    (!ql || `${e[2]} ${e[3]} ${e[1]} ${e[0]}`.toLowerCase().includes(ql)))
  const ex = E.find((x) => x[0] === cur)
  const toggle = (id) => setFav((f) => (f.includes(id) ? f.filter((y) => y !== id) : [...f, id]))

  return (
    <div>
      <div className="top">
        {ex && (
          <button className="ib" aria-label="Volver" onClick={() => (history.length > 1 ? history.back() : go())}>
            <Icon><path d="M15 18l-6-6 6-6" /></Icon>
          </button>
        )}
        <button className="logo" onClick={() => go()}><i>N</i>naereact</button>
      </div>
      <div className="wrap">
        {ex ? <Exercise key={ex[0]} ex={ex} /> : (
          <>
            <div className="hero">
              <h1>Bienvenido a naereact</h1>
              <p>30 ejercicios de C# convertidos a aplicaciones React. Elige uno del menú.</p>
              <div className="sb">
                <Icon size={18}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></Icon>
                <input placeholder="Buscar ejercicio, tema o número…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
            <div className="chips">
              {CATS.map((c) => (
                <button key={c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
            {list.length ? (
              <div className="grid">
                {list.map((x) => (
                  <div key={x[0]} style={{ position: 'relative' }}>
                    <button className="cd" style={{ width: '100%' }} onClick={() => go(x[0])}>
                      <span className="num">{x[0]}</span><b>{x[2]}</b><small>{x[1]}</small>
                    </button>
                    <button className={'st' + (fav.includes(x[0]) ? ' on' : '')} aria-label="Favorito" onClick={() => toggle(x[0])}>
                      <Star on={fav.includes(x[0])} />
                    </button>
                  </div>
                ))}
              </div>
            ) : <div className="empty">No se encontraron ejercicios.</div>}
            <p className="empty" style={{ padding: 20 }}>{list.length} de {E.length} ejercicios</p>
          </>
        )}
      </div>
    </div>
  )
}
