import { useEffect, useMemo, useState } from 'react';
import type { AnyMachine } from '@automatalab/contracts';
import { simulateMealy, simulateMoore, verifyEquivalenceProductMachine } from '@automatalab/automata';
import { PlaybackBar } from '../learning/PlaybackBar.js';
import { DiagramSvg } from '../learning/DiagramSvg.js';

interface Props {
  sourceMachine: AnyMachine;
  convertedMachine: AnyMachine;
  showDiagram?: boolean;
  onActiveStatesChange?: (source: string, target: string) => void;
}

function trace(machine: AnyMachine, input: string) {
  return machine.type === 'mealy' ? simulateMealy(machine, input) : simulateMoore(machine, input);
}

export function DualSimulationPanel({ sourceMachine, convertedMachine, showDiagram, onActiveStatesChange }: Props) {
  const binary = ['0', '1'].every(symbol => sourceMachine.alphabet.includes(symbol));
  const [input, setInput] = useState(binary ? '1100' : sourceMachine.alphabet[0]);
  const [step, setStep] = useState(0);
  const [playing, play] = useState(false);
  const [speed, setSpeed] = useState(1);
  const run = useMemo(() => {
    try {
      return { source: trace(sourceMachine, input), target: trace(convertedMachine, input) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unable to simulate this input.' };
    }
  }, [sourceMachine, convertedMachine, input]);
  const proof = useMemo(() => {
    try { return verifyEquivalenceProductMachine(sourceMachine, convertedMachine); }
    catch { return null; }
  }, [sourceMachine, convertedMachine]);
  const total = run.source?.inputSequence.length ?? 0;
  const current = Math.min(step, total);
  const from = run.source?.visitedStates[current];
  const to = run.target?.visitedStates[current];
  useEffect(() => {
    if (from && to) onActiveStatesChange?.(from, to);
  }, [from, to, onActiveStatesChange]);
  useEffect(() => {
    if (!playing) return;
    if (current >= total) { play(false); return; }
    const timer = setTimeout(() => setStep(current + 1), 1000 / speed);
    return () => clearTimeout(timer);
  }, [playing, current, total, speed]);
  function seek(index: number) { play(false); setStep(index); }
  function changeInput(value: string) { setInput(value); seek(0); }
  return <section className="tape-sheet">
    <div className="tape-config"><label htmlFor="test-input-string">Input string</label>
      <input id="test-input-string" value={input} maxLength={128} onChange={event => changeInput(event.target.value)} />
      <span>Alphabet · {sourceMachine.alphabet.join(', ')}</span>
      {(binary ? ['1100', '101', ''] : [sourceMachine.alphabet[0], '']).map(value =>
        <button key={value} onClick={() => changeInput(value)}>{value || 'Empty input'}</button>)}
    </div>
    {run.error && <p role="alert">{run.error}</p>}
    {run.source && run.target && <>
      {showDiagram && <DiagramSvg machine={sourceMachine} activeState={from} badge={sourceMachine.name} />}
      <PlaybackBar currentStep={current} totalSteps={total} isPlaying={playing} speed={speed}
        onSpeedChange={setSpeed} onSeek={seek} onReset={() => seek(0)}
        onStepPrev={() => seek(Math.max(0, current - 1))} onStepNext={() => seek(Math.min(total, current + 1))}
        onPlayToggle={() => { if (current === total) setStep(0); play(!playing && total > 0); }}
        caption={current ? 'After input ' + current + ', the source is in ' + from + ' and the converted machine is in ' + to + '.' : 'At Start, only the Moore machine has a state output.'} />
      <div className="overflow-x-auto"><table className="trace-table"><caption>Aligned execution trace</caption>
        <thead><tr><th scope="col">Input</th>{['Start', ...run.source.inputSequence].map((symbol, i) =>
          <th scope="col" key={i} data-active={i === current}>{symbol}</th>)}</tr></thead>
        <tbody>{[run.source, run.target].map((result, i) =>
          <tr key={i}><th scope="row">{i ? convertedMachine.type : sourceMachine.type} output</th>
            {result.steps.map((record, j) => <td key={j} data-active={j === current}>{record.emittedOutput ?? '—'}</td>)}</tr>)}
          <tr><th scope="row">Source state</th>{run.source.visitedStates.map((state, j) =>
            <td key={j} data-active={j === current}>{state}</td>)}</tr>
        </tbody></table></div>
    </>}
    <details><summary>Equivalence check · {proof ? proof.isEquivalent ? 'Equivalent' : 'Different outputs' : 'Unavailable'}</summary>
      <p>{proof?.explanation ?? 'The machines could not be verified.'}</p></details>
  </section>;
}
