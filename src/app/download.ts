// Saves text as a file the person can keep (an export). The name is made safe for a file system.
export const downloadText = (name: string, text: string, type = 'application/json') => {
  const blob = new Blob([text], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name.replace(/[^\p{L}\p{N} _.-]+/gu, '').trim() || 'workspace';
  link.click();
  URL.revokeObjectURL(link.href);
};
