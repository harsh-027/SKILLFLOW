const test = require("node:test");
const assert = require("node:assert/strict");
const { sanitizeUser } = require("../utils/userSanitizer");

test("sanitizer returns account and profile fields without image fields", () => {
  const user = sanitizeUser({
    _id: "user-1",
    userId: "harsh_027",
    name: "Harshit",
    role: "user",
  });

  assert.deepEqual(Object.keys(user).filter((key) => key.toLowerCase().includes("image")), []);
});

test("sanitizer preserves unrelated profile fields", () => {
  const user = sanitizeUser({
    _id: "user-2",
    userId: "new_user",
    name: "New User",
    role: "user",
    bio: "Learning systems design",
    location: "Lucknow",
  });

  assert.equal(user.bio, "Learning systems design");
  assert.equal(user.location, "Lucknow");
});
