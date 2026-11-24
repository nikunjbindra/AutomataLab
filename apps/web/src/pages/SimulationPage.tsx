import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { convertMealyToMoore, convertMooreToMealy } from '@automatalab/automata';
import { useMachinesQuery } from '../api/queries.js';
import { BENCHMARK_EXAMPLES } from '../components/conversion/ExampleGalleryModal.js';
import { DualSimulationPanel } from '../components/conversion/DualSimulationPanel.js';

export function SimulationPage() {
  const location = useLocation();
  const [id, select] = useState<string>(location.state?.machineId ?? BENCHMARK_EXAMPLES[0].id);
  const saved = useMachinesQuery();
  const machine = BENCHMARK_EXAMPLES.find(item => item.id === id)?.machine ?? saved.data?.find(item => item.id === id)?.machineData;
  const conversion = useMemo(() => {
    if (!machine) return null;
    try { return machine.type === 'mealy' ? convertMealyToMoore(machine).machine : convertMooreToMealy(machine).machine; }
    catch { return null; }
  }, [machine]);
  return <article><div className="book-kicker">Simulation laboratory</div>
    <h1>Follow an input string</h1><p className="book-lead">Advance one symbol at a time to compare the original and converted machines.</p>
    <label className="machine-picker">Machine <select value={id} onChange={event => select(event.target.value)}>
      {BENCHMARK_EXAMPLES.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      {saved.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select></label>
    {machine && conversion ? <DualSimulationPanel key={id} sourceMachine={machine} convertedMachine={conversion} showDiagram />
      : <p role="status">{saved.isLoading ? 'Loading machine…' : 'Check that the machine exists and has a complete transition table.'}</p>}
  </article>;
}
