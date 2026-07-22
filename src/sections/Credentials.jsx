import { certificates } from '../data.js'

export default function Credentials() {
  return (
    <section id="credentials" className="act act-solid">
      <div className="act-head">
        <span className="idx">06</span>
        <h2>Credentials</h2>
      </div>
      <div className="cred-grid">
        {certificates.map((c) => (
          <a
            key={c.file}
            className="cred-cell"
            href={c.file}
            target="_blank"
            rel="noreferrer"
            aria-label={`${c.title} certificate — ${c.issuer}`}
          >
            <span className="issuer caps">{c.issuer}</span>
            <span className="title">{c.title}</span>
            <span className="foot">
              <span className="i">{c.index}</span>
              <span className="v">View ↗</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
