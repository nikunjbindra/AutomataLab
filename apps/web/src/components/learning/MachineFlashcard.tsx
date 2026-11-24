import { useState } from 'react';

const cards = {
  Mealy: {
    definition: 'A Mealy machine is a finite-state machine whose output depends on both its current state and the input it reads.',
    example: 'Start at A and read 1. Follow the arrow marked 1/y to B. The y on that arrow is your answer.',
  },
  Moore: {
    definition: 'A Moore machine is a finite-state machine whose output depends only on its current state. Each state has one fixed output.',
    example: 'Start at S and read 1. You reach B_y. The y inside that circle is your answer whenever you land there.',
  },
};

export function MachineFlashcard({ machine }: { machine: keyof typeof cards }) {
  const [example, flip] = useState(false);
  const card = cards[machine];
  return (
    <button type="button" className="machine-flashcard" onClick={() => flip(!example)}>
      <span className="flex items-center justify-between gap-3">
        <strong>{example ? machine + ' example' : 'What is a ' + machine + ' machine?'}</strong>
        <span className="text-xs underline">{example ? 'See definition' : 'See example'}</span>
      </span>
      <span key={String(example)} className="flashcard-face">{example ? card.example : card.definition}</span>
    </button>
  );
}
