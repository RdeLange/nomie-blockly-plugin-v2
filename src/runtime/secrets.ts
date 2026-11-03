// Secrets: the names a workspace can use, and what Settings keeps. The values are never in a workspace or a file.

// A secret's name: letters, digits, _, - and . (so it reads the same in a block and in Settings)
export const SECRET_NAME = /^[A-Za-z0-9_.-]{1,60}$/;
