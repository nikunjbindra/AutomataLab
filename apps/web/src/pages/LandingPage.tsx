import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './landing.css';

type Input = '0' | '1';
const paths = {
  '0': 'M 133 70 C 66 8 32 140 128 103',
  '1': 'M 189 65 Q 265 18 344 64',
};

function TransitionSheet({ moore, input, turn }: { moore: boolean; input: Input | null; turn: number }) {
  const marker = useId().replace(/:/g, '');
  const name = moore ? 'Moore' : 'Mealy';
  return <section className={'cover-sheet ' + (moore ? 'moore-sheet' : 'mealy-sheet')} aria-label={name + ' diagram'}>
    <span className="sheet-tab">{name}</span>
    <svg viewBox="0 0 490 155" role="img" aria-label={moore
      ? 'From A x, input zero returns to A x with output x. Input one reaches B y with output y.'
      : 'From A, zero loops to A and outputs x. One goes to B and outputs y.'}>
      <defs><marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0 L10 5 L0 10 L3 5 Z" fill="currentColor" />
      </marker></defs>
      {(['0','1'] as const).map(symbol => <g key={symbol} className={symbol === input ? 'chosen-route' : ''}>
        <path d={paths[symbol]} className="cover-edge" markerEnd={'url(#' + marker + ')'} />
        <text x={symbol === '0' ? 89 : 266} y={symbol === '0' ? 42 : 32} className="edge-symbol">{moore ? symbol : symbol === '0' ? '0/x' : '1/y'}</text>
      </g>)}
      {[{x:160, state:'A', output:'x'}, {x:379, state:'B', output:'y'}].map((node,i) =>
        <g key={node.state} transform={'translate(' + node.x + ',85)'} className={input === String(i) ? 'chosen-node' : ''}>
          <circle r="39" className="cover-node"/>
          {moore ? <><path d="M-39 0 H39" className="cover-edge"/>
            <text y="-9">{node.state}<tspan dy="4" fontSize="16">{node.output}</tspan></text>
            <text y="26" fontSize="25">{node.output}</text></> : <text y="11">{node.state}</text>}
        </g>)}
      {input && <circle key={turn} r="4.2" className="travel-dot" style={{offsetPath: 'path("' + paths[input] + '")'}} />}
    </svg>
  </section>;
}

export function LandingPage() {
  const [trace, setTrace] = useState<{input: Input | null; turn: number}>({input:null,turn:0});
  return <article className="landing-cover">
    <div className="cover-copy"><p className="cover-subject">Automata Theory</p>
      <h1>Follow the arrow.<br/>Find the output.</h1>
      <p className="cover-intro">Build, convert and explore Mealy and Moore machines.</p>
      <div className="cover-actions"><Link to="/simulate">Open simulator <ArrowRight size={20}/></Link>
        <Link to="/docs">Explore lessons</Link></div>
    </div>
    <div className="cover-figure">
      <TransitionSheet moore={false} {...trace}/>
      <div className="cover-rule"><div className="cover-inputs" role="group" aria-label="Trace an input from A">
        <span>Try input</span>{(['0','1'] as const).map(input =>
          <button key={input} aria-pressed={trace.input === input} onClick={() => setTrace(prev => ({input,turn:prev.turn+1}))}>{input}</button>)}
      </div></div>
      <TransitionSheet moore {...trace}/>
      <p className="cover-result" aria-live="polite">{trace.input === '0' ? 'Read 0. Stay at A. Output x.' : trace.input === '1' ? 'Read 1. Move to B. Output y.' : 'Two ways to read the same move from A.'}</p>
    </div>
  </article>;
}
