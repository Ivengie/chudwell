// Vite injects BASE_URL from vite.config.js `base`, so images work locally and on GitHub Pages.
export const asset = (path) =>
  !path || /^(https?:|data:|blob:)/.test(path) ? path : import.meta.env.BASE_URL + path.replace(/^\//, "");

export const STORAGE = {
  theme: "Chudwell-theme",
  books: "inkwell_books",
  reader: "inkwell_reader_data",
  lists: "inkwell_lists",
  drafts: "inkwell_drafts",
  published: "inkwell_user_published",
  state: "inkwell_state",
};

export const ROLE_ACCOUNTS = [
  { username: "author", email: "author@chudwell.com", password: "author123", role: "writer", displayName: "Story Writer" },
  { username: "writer", email: "writer@chudwell.com", password: "writer123", role: "writer", displayName: "Story Writer" },
  { username: "reader", email: "reader@chudwell.com", password: "reader123", role: "reader", displayName: "Reader" },
];

export const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23545454'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";

const READER = { customizeProfile: true, changeDisplayName: true, createReadingLists: true, leaveComments: true, receiveNotifications: true, useReadingHistory: true };
export const PERMISSIONS = {
  guest: {},
  reader: READER,
  writer: { ...READER, manageWriting: true, publishBooks: true },
};

// Shelves > History (static, as in the original site)
export const HISTORY = [
  { id: 1, progress: 75 },
  { id: 2, progress: 90 },
];
