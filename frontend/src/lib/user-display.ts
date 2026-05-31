type UserLike = {
  userId?: string;
  name?: string;
};

export function getPreferredUserLabel(user?: UserLike | null): string {
  if (user?.userId && user.userId.trim()) {
    return `@${user.userId.trim()}`;
  }

  if (user?.name && user.name.trim()) {
    return user.name.trim();
  }

  return "User";
}

export function getSecondaryUserName(user?: UserLike | null): string {
  if (user?.name && user.name.trim()) {
    return user.name.trim();
  }

  return "";
}

export function getUserInitials(user?: UserLike | null): string {
  const source = user?.userId?.trim() || user?.name?.trim() || "User";
  const parts = source.split(/[\s._-]+/).filter(Boolean);

  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
