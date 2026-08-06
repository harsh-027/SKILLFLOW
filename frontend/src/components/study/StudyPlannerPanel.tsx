import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  Check,
  Clock3,
  Flame,
  LayoutGrid,
  ListChecks,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type {
  AiStudyScheduleInput,
  StudyPlannerEntry,
  StudyPlannerInput,
  StudyPriority,
  StudyStatus,
} from "@/types/studyPlanner";

const statuses: StudyStatus[] = ["Pending", "In Progress", "Completed"];
const priorities: StudyPriority[] = ["Low", "Medium", "High"];
const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const emptyForm: StudyPlannerInput = {
  title: "",
  subject: "",
  description: "",
  notes: "",
  priority: "Medium",
  status: "Pending",
  dueDate: "",
  estimatedHours: 1,
  actualHours: 0,
  scheduledDate: "",
  startTime: "09:00",
  durationHours: 1,
};

const emptyAiForm: AiStudyScheduleInput = {
  examDate: "",
  subjects: "",
  currentSkillLevel: "Intermediate",
  hoursAvailablePerDay: 2,
  preferredStudyDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  preferredSessionLength: 1,
};

function dateOnly(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isSameDay(value?: string | null, compareDate = new Date()) {
  const compareKey = `${compareDate.getFullYear()}-${String(compareDate.getMonth() + 1).padStart(2, "0")}-${String(compareDate.getDate()).padStart(2, "0")}`;
  return dateOnly(value) === compareKey;
}

function formatDate(value?: string | null) {
  if (!value) return "Unscheduled";
  const [year, month, day] = dateOnly(value).split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(year, month - 1, day));
}

function completion(entries: StudyPlannerEntry[]) {
  if (!entries.length) return 0;
  return Math.round((entries.filter((entry) => entry.status === "Completed").length / entries.length) * 100);
}

function getWeekStart(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function getStudyStreak(entries: StudyPlannerEntry[]) {
  const completedDays = new Set(
    entries
      .filter((entry) => entry.status === "Completed")
      .map((entry) => dateOnly(entry.scheduledDate || entry.dueDate || entry.updatedAt))
      .filter(Boolean)
  );
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (completedDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function toForm(entry: StudyPlannerEntry): StudyPlannerInput {
  return {
    title: entry.title,
    subject: entry.subject,
    description: entry.description || "",
    notes: entry.notes || "",
    priority: entry.priority,
    status: entry.status,
    dueDate: dateOnly(entry.dueDate),
    estimatedHours: entry.estimatedHours,
    actualHours: entry.actualHours,
    scheduledDate: dateOnly(entry.scheduledDate),
    startTime: entry.startTime || "09:00",
    durationHours: entry.durationHours || entry.estimatedHours || 1,
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof ListChecks;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <motion.div className="study-stat-card" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <span className="study-stat-icon"><Icon size={18} /></span>
      <span className="learning-stat-label">{label}</span>
      <strong className="learning-stat-value">{value}</strong>
      <span className="dashboard-overview-note">{note}</span>
    </motion.div>
  );
}

export default function StudyPlannerPanel({
  entries,
  loading,
  saving,
  generating,
  onCreate,
  onUpdate,
  onDelete,
  onGenerateAi,
}: {
  entries: StudyPlannerEntry[];
  loading: boolean;
  saving: boolean;
  generating: boolean;
  onCreate: (payload: StudyPlannerInput) => Promise<void>;
  onUpdate: (id: string, payload: StudyPlannerInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onGenerateAi: (payload: AiStudyScheduleInput) => Promise<void>;
}) {
  const [form, setForm] = useState<StudyPlannerInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<"Timeline" | "Calendar">("Timeline");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiForm, setAiForm] = useState<AiStudyScheduleInput>(emptyAiForm);

  const todayTasks = useMemo(
    () => {
      const key = todayKey();
      return entries.filter((entry) => dateOnly(entry.scheduledDate) === key || dateOnly(entry.dueDate) === key).slice(0, 5);
    },
    [entries]
  );

  const upcomingSessions = useMemo(
    () =>
      entries
        .filter((entry) => entry.scheduledDate)
        .sort((a, b) => `${dateOnly(a.scheduledDate)} ${a.startTime}`.localeCompare(`${dateOnly(b.scheduledDate)} ${b.startTime}`))
        .slice(0, 8),
    [entries]
  );

  const weeklyHours = useMemo(() => {
    const start = getWeekStart();
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return entries.reduce((sum, entry) => {
      const date = new Date(entry.scheduledDate || entry.updatedAt);
      if (date >= start && date < end) {
        return sum + Number(entry.actualHours || (entry.status === "Completed" ? entry.estimatedHours : 0));
      }
      return sum;
    }, 0);
  }, [entries]);

  const monthlyHours = useMemo(() => {
    const now = new Date();
    return entries.reduce((sum, entry) => {
      const date = new Date(entry.scheduledDate || entry.updatedAt);
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        return sum + Number(entry.actualHours || (entry.status === "Completed" ? entry.estimatedHours : 0));
      }
      return sum;
    }, 0);
  }, [entries]);

  const completePercent = completion(entries);
  const completedCount = entries.filter((entry) => entry.status === "Completed").length;
  const totalHours = entries.reduce((sum, entry) => sum + Number(entry.actualHours || 0), 0);
  const streak = getStudyStreak(entries);
  const subjects = Array.from(new Set(entries.map((entry) => entry.subject).filter(Boolean))).slice(0, 6);

  const calendarDays = useMemo(() => {
    const start = getWeekStart();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return {
        key,
        label: weekDays[date.getDay()].slice(0, 3),
        date: formatDate(key),
        entries: entries.filter((entry) => dateOnly(entry.scheduledDate) === key),
      };
    });
  }, [entries]);

  const submitTask = async (event: FormEvent) => {
    event.preventDefault();
    if (editingId) {
      await onUpdate(editingId, form);
    } else {
      await onCreate(form);
    }
    setForm(emptyForm);
    setEditingId(null);
  };

  const editEntry = (entry: StudyPlannerEntry) => {
    setEditingId(entry._id);
    setForm(toForm(entry));
  };

  const markComplete = async (entry: StudyPlannerEntry) => {
    await onUpdate(entry._id, {
      ...toForm(entry),
      status: entry.status === "Completed" ? "Pending" : "Completed",
      actualHours: entry.status === "Completed" ? entry.actualHours : entry.actualHours || entry.estimatedHours,
    });
  };

  const submitAi = async (event: FormEvent) => {
    event.preventDefault();
    await onGenerateAi(aiForm);
    setAiOpen(false);
    setAiForm(emptyAiForm);
  };

  return (
    <div className="study-planner-shell">
      <section className="study-hero">
        <div className="study-hero-copy">
          <span className="learning-badge"><CalendarDays size={14} /> Study Planner</span>
          <h1>Plan focused study sessions without losing the SkillFlow feel.</h1>
          <p>Track tasks, sessions, hours, streaks, and progress from one polished productivity workspace.</p>
        </div>
        <div className="study-hero-actions">
          <button type="button" className="btn-red" onClick={() => setAiOpen(true)}>
            <Sparkles size={16} />
            Generate AI Study Schedule
          </button>
          <button
            type="button"
            className="btn-outline-red"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </section>

      <section className="study-stat-grid">
        <StatCard icon={ListChecks} label="Today's Study Tasks" value={`${todayTasks.length}`} note="Due or scheduled today" />
        <StatCard icon={Clock3} label="Total Hours Studied" value={`${totalHours.toFixed(1)}h`} note={`${weeklyHours.toFixed(1)}h this week`} />
        <StatCard icon={Flame} label="Study Streak" value={`${streak}d`} note="Completed study days" />
        <StatCard icon={BarChart3} label="Completion Percentage" value={`${completePercent}%`} note={`${completedCount}/${entries.length || 0} tasks complete`} />
      </section>

      <div className="study-layout">
        <motion.article className="learning-panel study-task-panel" layout>
          <div className="dashboard-section-head">
            <div>
              <div className="dashboard-kicker">{editingId ? "Edit task" : "Task manager"}</div>
              <h2 className="section-title">{editingId ? "Update study task" : "Add study task"}</h2>
            </div>
          </div>

          <form className="study-form" onSubmit={submitTask}>
            <input className="input-dark" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Task title" required />
            <input className="input-dark" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Subject" required />
            <div className="study-form-row">
              <select className="input-dark" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as StudyPriority })}>
                {priorities.map((priority) => <option key={priority}>{priority}</option>)}
              </select>
              <select className="input-dark" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as StudyStatus })}>
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
            <div className="study-form-row">
              <input className="input-dark" type="number" min="0" step="0.5" value={form.estimatedHours} onChange={(event) => setForm({ ...form, estimatedHours: Number(event.target.value), durationHours: Number(event.target.value) })} placeholder="Estimated hours" />
              <input className="input-dark" type="number" min="0" step="0.5" value={form.actualHours} onChange={(event) => setForm({ ...form, actualHours: Number(event.target.value) })} placeholder="Actual hours" />
            </div>
            <div className="study-form-row">
              <input className="input-dark" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
              <input className="input-dark" type="date" value={form.scheduledDate} onChange={(event) => setForm({ ...form, scheduledDate: event.target.value })} />
            </div>
            <div className="study-form-row">
              <input className="input-dark" type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} />
              <input className="input-dark" type="number" min="0.5" max="8" step="0.5" value={form.durationHours} onChange={(event) => setForm({ ...form, durationHours: Number(event.target.value) })} placeholder="Duration" />
            </div>
            <textarea className="input-dark" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />
            <textarea className="input-dark" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Notes" />
            <div className="study-actions">
              <button type="submit" className="btn-red" disabled={saving || !form.title.trim() || !form.subject.trim()}>
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Task"}
              </button>
              {editingId ? (
                <button type="button" className="btn-ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </motion.article>

        <section className="study-main-stack">
          <article className="learning-panel">
            <div className="dashboard-section-head">
              <div>
                <div className="dashboard-kicker">Dashboard</div>
                <h2 className="section-title">Today's Study Tasks</h2>
              </div>
            </div>
            <div className="study-task-list">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => <div key={index} className="study-skeleton" />)
              ) : todayTasks.length ? (
                <AnimatePresence>
                  {todayTasks.map((entry) => (
                    <motion.div key={entry._id} className={`study-task-card ${entry.status === "Completed" ? "complete" : ""}`} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <button type="button" className="ai-path-check" onClick={() => markComplete(entry)} aria-label="Toggle complete">
                        <Check size={14} />
                      </button>
                      <div>
                        <strong>{entry.title}</strong>
                        <span>{entry.subject} - {entry.priority} priority - {entry.estimatedHours}h</span>
                      </div>
                      <div className="study-card-actions">
                        <button type="button" className="btn-ghost btn-icon-only" onClick={() => editEntry(entry)} aria-label="Edit task" title="Edit task"><Pencil size={15} /></button>
                        <button type="button" className="btn-ghost btn-icon-only" onClick={() => onDelete(entry._id)} aria-label="Delete task" title="Delete task"><Trash2 size={15} /></button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="study-empty-state">
                  <ListChecks size={26} />
                  <strong>No tasks for today</strong>
                  <span>Add a task or schedule a session to start shaping your day.</span>
                </div>
              )}
            </div>
          </article>

          <article className="learning-panel">
            <div className="dashboard-section-head">
              <div>
                <div className="dashboard-kicker">Calendar / Schedule</div>
                <h2 className="section-title">Upcoming Study Sessions</h2>
              </div>
              <div className="tab-switcher study-view-tabs">
                {(["Timeline", "Calendar"] as const).map((tab) => (
                  <button key={tab} type="button" className={`tab-item ${view === tab ? "active" : ""}`} onClick={() => setView(tab)}>
                    {tab === "Timeline" ? <ListChecks size={14} /> : <LayoutGrid size={14} />}
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {view === "Timeline" ? (
                <motion.div key="timeline" className="study-timeline" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  {upcomingSessions.length ? upcomingSessions.map((entry) => (
                    <div key={entry._id} className="study-session-row">
                      <div className="study-session-time">
                        <strong>{formatDate(entry.scheduledDate)}</strong>
                        <span>{entry.startTime || "Anytime"}</span>
                      </div>
                      <div className="study-session-body">
                        <strong>{entry.title}</strong>
                        <span>{entry.subject} - {entry.durationHours || entry.estimatedHours}h - {entry.status}</span>
                      </div>
                      <div className={`study-priority ${entry.priority.toLowerCase()}`}>{entry.priority}</div>
                    </div>
                  )) : (
                    <div className="study-empty-state compact"><CalendarDays size={24} /><strong>No sessions scheduled</strong><span>Select a date and start time on a task to place it here.</span></div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="calendar" className="study-calendar-grid" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  {calendarDays.map((day) => (
                    <div key={day.key} className="study-day-column">
                      <div className="learning-day-header">
                        <strong>{day.label}</strong>
                        <span className="learning-day-count">{day.date}</span>
                      </div>
                      <div className="study-day-items">
                        {day.entries.length ? day.entries.map((entry) => (
                          <button key={entry._id} type="button" className="study-calendar-task" onClick={() => editEntry(entry)}>
                            <strong>{entry.startTime || "--:--"}</strong>
                            <span>{entry.title}</span>
                          </button>
                        )) : <span className="study-day-empty">Open</span>}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        </section>
      </div>

      <section className="learning-panel study-progress-panel">
        <div className="dashboard-section-head">
          <div>
            <div className="dashboard-kicker">Progress</div>
            <h2 className="section-title">Weekly Progress</h2>
          </div>
        </div>
        <div className="study-progress-grid">
          {[
            ["Weekly Study Hours", weeklyHours, Math.max(weeklyHours, 10)],
            ["Monthly Study Hours", monthlyHours, Math.max(monthlyHours, 40)],
            ["Tasks Completed", completedCount, Math.max(entries.length, 1)],
            ["Completion %", completePercent, 100],
          ].map(([label, value, max]) => (
            <div key={label} className="study-progress-card">
              <div className="learning-phase-meta"><span>{label}</span><strong>{value}{label === "Completion %" ? "%" : ""}</strong></div>
              <div className="learning-progress-track"><div className="ai-progress-value" style={{ width: `${Math.min(100, (Number(value) / Number(max)) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="dashboard-pill-list">
          {subjects.length ? subjects.map((subject) => <span key={subject} className="dashboard-chip">{subject}</span>) : <span className="dashboard-chip">No subjects yet</span>}
        </div>
      </section>

      <AnimatePresence>
        {aiOpen ? (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form className="modal-box study-ai-modal" onSubmit={submitAi} initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }}>
              <div className="study-modal-head">
                <h2 className="modal-title">Generate AI Study Schedule</h2>
                <button type="button" className="btn-ghost btn-icon-only" onClick={() => setAiOpen(false)} aria-label="Close"><X size={16} /></button>
              </div>
              <div className="study-form">
                <input className="input-dark" type="date" value={aiForm.examDate} onChange={(event) => setAiForm({ ...aiForm, examDate: event.target.value })} required />
                <input className="input-dark" value={aiForm.subjects} onChange={(event) => setAiForm({ ...aiForm, subjects: event.target.value })} placeholder="Subjects, separated by commas" required />
                <input className="input-dark" value={aiForm.currentSkillLevel} onChange={(event) => setAiForm({ ...aiForm, currentSkillLevel: event.target.value })} placeholder="Current skill level" required />
                <div className="study-form-row">
                  <input className="input-dark" type="number" min="0.5" max="16" step="0.5" value={aiForm.hoursAvailablePerDay} onChange={(event) => setAiForm({ ...aiForm, hoursAvailablePerDay: Number(event.target.value) })} placeholder="Hours per day" />
                  <input className="input-dark" type="number" min="0.5" max="8" step="0.5" value={aiForm.preferredSessionLength} onChange={(event) => setAiForm({ ...aiForm, preferredSessionLength: Number(event.target.value) })} placeholder="Session length" />
                </div>
                <div className="study-day-picker">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`learning-chip compact ${aiForm.preferredStudyDays.includes(day) ? "active" : ""}`}
                      onClick={() =>
                        setAiForm((prev) => ({
                          ...prev,
                          preferredStudyDays: prev.preferredStudyDays.includes(day)
                            ? prev.preferredStudyDays.filter((item) => item !== day)
                            : [...prev.preferredStudyDays, day],
                        }))
                      }
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="study-actions">
                <button type="submit" className="btn-red" disabled={generating || !aiForm.examDate || !aiForm.subjects.trim()}>
                  <Sparkles size={16} />
                  {generating ? "Generating..." : "Create Editable Schedule"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
