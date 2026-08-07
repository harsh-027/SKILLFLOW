import { useEffect, useMemo, useState } from "react";
import SwapRequestModal from "../components/SwapRequestModal";
import UserCard from "../components/UserCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import PaginationControls from "@/components/PaginationControls";
import { useApp } from "../context/AppContext";
import API from "../api/axios";
import { defaultPaginationMeta, readPaginatedItems, readPaginationMeta } from "@/lib/pagination";
import { getPreferredUserLabel, getSecondaryUserName } from "../lib/user-display";

const PAGE_LIMIT = 20;

function UsersPage() {
  const { currentUser, sendRequest, addToast } = useApp();
  const [query, setQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("All Skills");
  const [usersList, setUsersList] = useState([]);
  const [pagination, setPagination] = useState(defaultPaginationMeta);
  const [page, setPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sendingSwap, setSendingSwap] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [query, skillFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const { data } = await API.get("/users", {
          params: {
            page,
            limit: PAGE_LIMIT,
            ...(query.trim() ? { search: query.trim() } : {}),
            ...(skillFilter !== "All Skills" ? { skill: skillFilter } : {}),
          },
        });
        setUsersList(readPaginatedItems(data).filter((user) => user.role !== "admin"));
        setPagination(readPaginationMeta(data));
      } catch (error) {
        if (!error.response || (error.response.status !== 401 && error.response.status !== 403)) {
          addToast("Unable to load users.", "error");
        }
        setUsersList([]);
        setPagination(defaultPaginationMeta);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [addToast, page, query, skillFilter]);

  const skillOptions = useMemo(() => {
    const allSkills = usersList.flatMap((user) => [
      ...user.skillsOffered,
      ...user.skillsWanted,
    ]);
    return ["All Skills", ...new Set(allSkills)];
  }, [usersList]);

  const filteredUsers = useMemo(() => {
    return usersList.filter((user) => {
      const normalizedQuery = query.toLowerCase();
      const primaryLabel = getPreferredUserLabel(user).toLowerCase();
      const secondaryName = getSecondaryUserName(user).toLowerCase();
      const searchMatch =
        primaryLabel.includes(normalizedQuery) ||
        secondaryName.includes(normalizedQuery) ||
        user.skillsOffered.some((skill) =>
          skill.toLowerCase().includes(normalizedQuery)
        ) ||
        user.skillsWanted.some((skill) =>
          skill.toLowerCase().includes(normalizedQuery)
        );

      const skillMatch =
        skillFilter === "All Skills" ||
        user.skillsOffered.includes(skillFilter) ||
        user.skillsWanted.includes(skillFilter);

      return searchMatch && skillMatch;
    });
  }, [usersList, query, skillFilter]);

  const handleRequest = async (targetUser) => {
    if (!currentUser) {
      addToast("Please login to send swap requests.", "warning");
      return;
    }

    setSelectedUser(targetUser);
    setIsSwapModalOpen(true);
  };

  const handleCloseSwapModal = () => {
    if (sendingSwap) {
      return;
    }
    setIsSwapModalOpen(false);
    setSelectedUser(null);
  };

  const handleSubmitSwap = async ({ skillOffered, skillWanted }) => {
    if (!selectedUser) {
      return;
    }

    setSendingSwap(true);
    const success = await sendRequest({
      receiverId: selectedUser._id,
      skillOffered,
      skillWanted,
    });
    setSendingSwap(false);

    if (success) {
      handleCloseSwapModal();
    }
  };

  return (
    <section className="page users-page">
      <div className="section-head">
        <h2>Browse Users</h2>
        <p className="section-sub users-page-sub">Discover people by name, interests, and shared skill goals.</p>
      </div>

      <div className="glass-card filters">
        <div className="floating-field">
          <label>Search by name or skill</label>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search members, offers, or learning goals"
          />
        </div>

        <div className="floating-field">
          <label>Filter by skill</label>
          <select
            value={skillFilter}
            onChange={(event) => setSkillFilter(event.target.value)}
          >
            {skillOptions.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingUsers ? (
        <div className="card">
          <LoadingIndicator label="Loading users..." />
        </div>
      ) : (
        <>
          <div className="user-grid">
            {filteredUsers.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                currentUser={currentUser}
                onRequest={handleRequest}
              />
            ))}
          </div>
          {!filteredUsers.length ? <div className="card"><p className="muted">No users match the current filters.</p></div> : null}
          <PaginationControls meta={pagination} onPageChange={setPage} />
        </>
      )}

      <SwapRequestModal
        isOpen={isSwapModalOpen}
        currentUser={currentUser}
        targetUser={selectedUser}
        submitting={sendingSwap}
        onClose={handleCloseSwapModal}
        onSubmit={handleSubmitSwap}
      />
    </section>
  );
}

export default UsersPage;
