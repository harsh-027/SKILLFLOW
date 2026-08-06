import { useEffect, useState } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import StudyPlannerPanel from "@/components/study/StudyPlannerPanel";
import { useApp } from "@/context/AppContext";
import {
  createStudyPlannerEntry,
  deleteStudyPlannerEntry,
  generateAiStudySchedule,
  getStudyPlannerEntries,
  updateStudyPlannerEntry,
} from "@/services/studyPlannerService";
import type { AiStudyScheduleInput, StudyPlannerEntry, StudyPlannerInput } from "@/types/studyPlanner";

export default function StudyPlannerPage() {
  const { currentUser, addToast, bootstrapping } = useApp();
  const [entries, setEntries] = useState<StudyPlannerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    let mounted = true;
    setLoading(true);
    getStudyPlannerEntries()
      .then((items) => {
        if (mounted) setEntries(items);
      })
      .catch(() => addToast("Unable to load study planner.", "error"))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [addToast, currentUser]);

  const handleCreate = async (payload: StudyPlannerInput) => {
    setSaving(true);
    try {
      const entry = await createStudyPlannerEntry(payload);
      setEntries((prev) => [entry, ...prev]);
      addToast("Study task added.", "success");
    } catch {
      addToast("Unable to add task.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, payload: StudyPlannerInput) => {
    setSaving(true);
    try {
      const entry = await updateStudyPlannerEntry(id, payload);
      setEntries((prev) => prev.map((item) => (item._id === id ? entry : item)));
      addToast(entry.status === "Completed" ? "Task completed." : "Study task updated.", "success");
    } catch {
      addToast("Unable to update task.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudyPlannerEntry(id);
      setEntries((prev) => prev.filter((entry) => entry._id !== id));
      addToast("Study task deleted.", "success");
    } catch {
      addToast("Unable to delete task.", "error");
    }
  };

  const handleGenerateAi = async (payload: AiStudyScheduleInput) => {
    setGenerating(true);
    try {
      const generated = await generateAiStudySchedule(payload);
      setEntries((prev) => [...generated, ...prev]);
      addToast(`Generated ${generated.length} editable planner entries.`, "success");
    } catch {
      addToast("Unable to generate AI study schedule.", "error");
    } finally {
      setGenerating(false);
    }
  };

  if (bootstrapping) {
    return <div className="page"><div className="card"><LoadingIndicator label="Loading study planner..." /></div></div>;
  }

  if (!currentUser) return null;

  return (
    <div className="page min-w-0 study-planner-page">
      <StudyPlannerPanel
        entries={entries}
        loading={loading}
        saving={saving}
        generating={generating}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onGenerateAi={handleGenerateAi}
      />
    </div>
  );
}
