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
