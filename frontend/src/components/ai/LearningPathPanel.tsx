import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Compass, Sparkles } from "lucide-react";
import type { AiLearningPath } from "@/types/ai";

type ProgressState = Record<string, boolean>;

function getStorageKey(targetSkill: string) {
  return `skillflow-ai-path-progress:${targetSkill.toLowerCase()}`;
}

function readProgress(targetSkill: string) {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(getStorageKey(targetSkill)) || "{}") as ProgressState;
  } catch {
    return {};
  }
}

export default function LearningPathPanel({
  learningPath,
  loading,
  onGenerate,
  targetSkill,
  onTargetSkillChange,
  suggestions,
}: {
  learningPath: AiLearningPath | null;
  loading: boolean;
  onGenerate: (targetSkill: string) => void;
  targetSkill: string;
  onTargetSkillChange: (value: string) => void;
  suggestions: string[];
}) {
  const [activeLevel, setActiveLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<ProgressState>({});

  const level = learningPath?.levels.find((item) => item.phase === activeLevel) || null;

  useEffect(() => {
    if (!learningPath?.targetSkill) {
      return;
    }

    setProgress(readProgress(learningPath.targetSkill));
  }, [learningPath?.targetSkill]);

  const completedSteps = learningPath
    ? Object.values(progress).filter(Boolean).length
    : 0;
  const totalSteps = learningPath?.levels.reduce((sum, item) => sum + item.steps.length, 0) || 0;

  const toggleStep = (stepKey: string) => {
    const nextProgress = {
      ...progress,
      [stepKey]: !progress[stepKey],
    };

    setProgress(nextProgress);
    if (typeof window !== "undefined" && learningPath?.targetSkill) {
      window.localStorage.setItem(getStorageKey(learningPath.targetSkill), JSON.stringify(nextProgress));
    }
  };

  return (
    <article className="card dashboard-feed-card ai-panel-card">
      <div className="dashboard-section-head">
        <div>
          <div className="dashboard-kicker">Learning roadmap</div>
          <h3 className="section-title">AI Learning Path Generator</h3>
          <p className="section-sub">Generate a staged roadmap with clear steps, durations, and trackable progress.</p>
        </div>
      </div>

      <div className="ai-path-form">
        <input
          value={targetSkill}
          onChange={(event) => onTargetSkillChange(event.target.value)}
          className="input-dark"
          placeholder="Choose a target skill"
          list="skillflow-roadmap-suggestions"
        />
        <datalist id="skillflow-roadmap-suggestions">
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
        <button
          type="button"
          className="btn-red"
          onClick={() => onGenerate(targetSkill)}
          disabled={loading || !targetSkill.trim()}
        >
          {loading ? "Generating..." : "Generate Path"}
          <Compass size={14} />
        </button>
      </div>

      {learningPath ? (
        <>
          <div className="ai-path-summary">
            <div>
              <p className="ai-path-target">{learningPath.title}</p>
              <p className="ai-path-copy">{learningPath.summary}</p>
              {learningPath.fallback ? (
                <div className="dashboard-chip mt-3">Fallback roadmap active</div>
              ) : null}
            </div>
            <div className="ai-path-progress">
              <span>{totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0}% tracked</span>
              <strong>{completedSteps}/{totalSteps} steps</strong>
              <div className="ai-progress-track">
                <div
                  className="ai-progress-value"
                  style={{ width: `${totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="tab-switcher ai-path-tabs">
            {(["Beginner", "Intermediate", "Advanced"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`tab-item ${activeLevel === tab ? "active" : ""}`}
                onClick={() => setActiveLevel(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="ai-path-timeline">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLevel}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.24 }}
              >
                {(level?.steps || []).map((step, index) => {
                  const stepKey = `${learningPath.targetSkill}:${activeLevel}:${index}`;
                  const isExpanded = Boolean(expandedSteps[stepKey]);
                  const isComplete = Boolean(progress[stepKey]);

                  return (
                    <div key={stepKey} className={`ai-path-step ${isComplete ? "complete" : ""}`}>
                      <div className="ai-path-step-marker">
                        <button
                          type="button"
                          className={`ai-path-check ${isComplete ? "checked" : ""}`}
                          onClick={() => toggleStep(stepKey)}
                          aria-label={`Mark ${step.title} as ${isComplete ? "incomplete" : "complete"}`}
                        >
                          <Sparkles size={12} />
                        </button>
                      </div>

                      <div className="ai-path-step-body">
                        <button
                          type="button"
                          className="ai-path-step-toggle"
                          onClick={() =>
                            setExpandedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }))
                          }
                        >
                          <div>
                            <p className="ai-path-step-title">{step.title}</p>
                            <p className="ai-path-step-copy">{step.description}</p>
                          </div>
                          <div className="ai-path-step-side">
                            <span>{step.duration}</span>
                            <ChevronDown size={16} className={isExpanded ? "rotated" : ""} />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              className="ai-path-step-details"
                            >
                              <div className="ai-mini-goal">{step.difficulty}</div>
                              <div className="ai-mini-goal">{step.duration}</div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      ) : null}
    </article>
  );
}
