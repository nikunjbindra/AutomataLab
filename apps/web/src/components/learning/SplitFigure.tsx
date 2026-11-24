import { useState } from 'react';

export function SplitFigure() {
  const [output, select] = useState<'x' | 'y'>('x');
  return <figure className="split-figure">
    <div className="figure-heading"><span>Mealy · read the arrow</span><span>Moore · read the circle</span></div>
    <svg viewBox="0 0 760 210" role="img" aria-label={'Incoming transition with output ' + output + ' leads to A_' + output}>
      <defs><marker id="ink-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7Z" fill="currentColor"/></marker></defs>
      {[{ symbol: 'x', y: 57, from:'A' }, { symbol:'y', y:153, from:'B' }].map(({symbol,y,from}) =>
        <g key={symbol} className={output === symbol ? 'ink-selected' : 'ink-muted'}>
          <text x="35" y={y-12}>from {from} · 0/{symbol}</text>
          <path d={'M35 '+ y +' Q140 '+ y +' 183 '+ (symbol==='x'?91:119)} markerEnd="url(#ink-arrow)" />
          <path d={'M482 '+ y +' H572'} markerEnd="url(#ink-arrow)" />
          <text x="489" y={y-12}>out {symbol}</text>
          <circle cx="614" cy={y} r="34" />
          <text className="figure-state" x="614" y={y+8} textAnchor="middle">A<tspan baselineShift="sub" fontSize="17">{symbol}</tspan></text>
        </g>)}
      <circle cx="222" cy="105" r="39"/><text className="figure-state" x="222" y="114" textAnchor="middle">A</text>
      <text className="figure-state" x="355" y="115">→</text>
    </svg>
    <figcaption><div><h2>One state, two arrivals</h2><p>Read 0/x as “input 0, answer x.” Both arrows lead to A on input 0, but the arrow from B gives y.</p></div>
      <div><h2>One copy per output</h2><p>Choose Output x below to see the copy called Aₓ. Choose Output y to see Aᵧ. Both copies follow the same rules as A on the next input.</p></div></figcaption>
    <div className="figure-controls"><span>Trace an arrival</span>{(['x','y'] as const).map(symbol =>
      <button key={symbol} aria-pressed={output===symbol} onClick={() => select(symbol)}>Output {symbol}</button>)}</div>
  </figure>;
}
