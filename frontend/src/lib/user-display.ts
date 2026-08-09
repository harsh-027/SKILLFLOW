type UserLike = {
  userId?: string;
  name?: string;
  avatar?: string;
  banner?: string;
  profileImage?: string;
  bannerImage?: string;
  updatedAt?: string;
};

export const DEFAULT_PROFILE_IMAGE = "/assets/default-profile.png";
export const DEFAULT_BANNER_IMAGE = "/assets/default-banner.png";

function resolveImage(primary: string | undefined, legacy: string | undefined, fallback: string): string {
  if (primary && primary !== fallback) {
    return primary;
  }

  if (legacy && legacy !== fallback) {
    return legacy;
  }

  return fallback;
}

function versionImageUrl(imageUrl: string, updatedAt?: string): string {
  if (!updatedAt || imageUrl.startsWith("data:") || imageUrl === DEFAULT_PROFILE_IMAGE || imageUrl === DEFAULT_BANNER_IMAGE) {
    return imageUrl;
  }

  const separator = imageUrl.includes("?") ? "&" : "?";
  return `${imageUrl}${separator}v=${encodeURIComponent(updatedAt)}`;
}

export function getProfileImage(user?: UserLike | null): string {
  return versionImageUrl(resolveImage(user?.profileImage, user?.avatar, DEFAULT_PROFILE_IMAGE), user?.updatedAt);
}

export function getBannerImage(user?: UserLike | null): string {
  return versionImageUrl(resolveImage(user?.bannerImage, user?.banner, DEFAULT_BANNER_IMAGE), user?.updatedAt);
}

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
