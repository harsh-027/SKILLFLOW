import { useEffect, useMemo, useState } from "react";

function SwapRequestModal({ isOpen, currentUser, targetUser, submitting = false, onClose, onSubmit }) {
  const [skillOffered, setSkillOffered] = useState("");
  const [skillWanted, setSkillWanted] = useState("");
  const offeredOptions = useMemo(() => currentUser?.skillsOffered || [], [currentUser]);
  const wantedOptions = useMemo(() => targetUser?.skillsOffered || [], [targetUser]);

  useEffect(() => {
    if (!isOpen) return;
    setSkillOffered(offeredOptions[0] || "");
    setSkillWanted(wantedOptions[0] || "");
  }, [isOpen, offeredOptions, wantedOptions]);

  if (!isOpen || !targetUser) return null;
  const canSubmit = Boolean(skillOffered && skillWanted && !submitting);
  const handleSubmit = (event) => { event.preventDefault(); if (!canSubmit) return; onSubmit({ skillOffered, skillWanted }); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-box" onClick={(event) => event.stopPropagation()}>
        <h3 className="modal-title">Request Skill Swap</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
          <select className="input-dark" value={skillOffered} onChange={(event) => setSkillOffered(event.target.value)} required>
            {offeredOptions.length ? offeredOptions.map((skill) => <option key={`offered-${skill}`} value={skill}>{skill}</option>) : <option value="">No offered skills available</option>}
          </select>
          <select className="input-dark" value={skillWanted} onChange={(event) => setSkillWanted(event.target.value)} required>
            {wantedOptions.length ? wantedOptions.map((skill) => <option key={`wanted-${skill}`} value={skill}>{skill}</option>) : <option value="">No target skills available</option>}
          </select>
          <div className="card-actions" style={{ justifyContent: "space-between", marginTop: "8px" }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-red" style={{ width: '100%', justifyContent: 'center' }} disabled={!canSubmit}>{submitting ? "Sending..." : "Send Request"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SwapRequestModal;
