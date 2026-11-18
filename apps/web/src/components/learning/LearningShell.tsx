import React, { useState } from 'react';
import { LESSONS, type LessonId } from './types.js';
import { LessonMealyVsMoore } from './LessonMealyVsMoore.js';
import { LessonStateSplitting } from './LessonStateSplitting.js';
import { LessonSimulation } from './LessonSimulation.js';
import { LessonTableDiagramSync } from './LessonTableDiagramSync.js';
import { LessonConversionTrace } from './LessonConversionTrace.js';
import { PageHeader } from '../PageHeader.js';
import { StatusBadge } from '../StatusBadge.js';
import {
  GraduationCap,
  Workflow,
  Split,
  PlayCircle,
  Grid,
  GitCommit,
  CheckCircle,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Workflow,
  Split,
  PlayCircle,
  Grid,
  GitCommit,
};

export const LearningShell: React.FC = () => {
  const [activeLessonId, setActiveLessonId] = useState<LessonId>('mealy-vs-moore');
  const [completedLessons, setCompletedLessons] = useState<Set<LessonId>>(
    new Set(['mealy-vs-moore'])
  );

  const activeLesson = LESSONS.find((l) => l.id === activeLessonId) || LESSONS[0];

  const handleSelectLesson = (id: LessonId) => {
    setActiveLessonId(id);
    setCompletedLessons((prev) => new Set([...prev, id]));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        title="Visual Learning Lab"
        description="Interactive, animation-driven educational workbench for Mealy and Moore automata theory."
        badge={
          <StatusBadge
            variant="cyan"
            size="sm"
            label={`${completedLessons.size} / ${LESSONS.length} Lessons Explored`}
          />
        }
      />

      {/* Lesson Navigation Tabs Bar */}
      <div className="rounded-xl border border-border bg-surface p-1.5 shadow-subtle overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max" aria-label="Learning Lessons">
          {LESSONS.map((lesson) => {
            const Icon = iconMap[lesson.iconName] || GraduationCap;
            const isActive = lesson.id === activeLessonId;
            const isCompleted = completedLessons.has(lesson.id);

            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => handleSelectLesson(lesson.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all select-none ${
                  isActive
                    ? 'bg-accent-blue text-white shadow-sm font-bold'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-accent-blue'}`} />
                <span>{lesson.shortTitle}</span>
                {isCompleted && !isActive && (
                  <CheckCircle className="w-3 h-3 text-accent-emerald ml-0.5" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Lesson Description Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-surface-elevated/40 shadow-subtle">
        <div className="space-y-0.5">
          <h2 className="text-sm font-mono font-bold text-foreground flex items-center gap-2">
            <span>{activeLesson.title}</span>
          </h2>
          <p className="text-xs text-foreground-muted font-sans">
            {activeLesson.subtitle}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-foreground-muted">
          <span className="px-2 py-0.5 rounded bg-surface border border-border">
            Lesson {activeLesson.number} of {LESSONS.length}
          </span>
        </div>
      </div>

      {/* Active Lesson Content Component */}
      <main className="transition-all duration-300">
        {activeLessonId === 'mealy-vs-moore' && <LessonMealyVsMoore />}
        {activeLessonId === 'state-splitting' && <LessonStateSplitting />}
        {activeLessonId === 'string-simulation' && <LessonSimulation />}
        {activeLessonId === 'table-to-diagram' && <LessonTableDiagramSync />}
        {activeLessonId === 'conversion-explanation' && <LessonConversionTrace />}
      </main>
    </div>
  );
};
