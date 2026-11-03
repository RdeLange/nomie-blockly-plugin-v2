// Remembered values: what a workspace keeps from one run to the next (streaks, "change since yesterday").
// Only JSON values are kept, and each workspace has a limit, so one workspace cannot fill the stored state.

export const MAX_MEMORY_NAMES = 100;
export const MAX_MEMORY_BYTES = 10 * 1024;

export type Memory = Record<string, unknown>;

// JSON values only: numbers (finite), text, true and false, null, lists and plain objects.
// Depth is limited, so a cyclic value cannot make this loop.
export const isJsonValue = (value: unknown, depth = 0): boolean => {
  if (depth > 20) return false;
  if (value === null) return true;
  switch (typeof value) {
    case 'string':
    case 'boolean':
      return true;
    case 'number':
      return Number.isFinite(value);
    case 'object': {
      if (Array.isArray(value)) return value.every((item) => isJsonValue(item, depth + 1));
      const proto = Object.getPrototypeOf(value);
      if (proto !== Object.prototype && proto !== null) return false;
      return Object.values(value as Record<string, unknown>).every((item) => isJsonValue(item, depth + 1));
    }
    default:
      return false;
  }
};

// The size of the remembered values, as stored (UTF-8 bytes of their JSON)
export const memoryBytes = (memory: Memory): number => new TextEncoder().encode(JSON.stringify(memory)).length;

// A stored memory: anything that is not a plain object of JSON values is dropped
export const readMemory = (raw: unknown): Memory => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const memory: Memory = {};
  for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
    if (isJsonValue(value)) memory[name] = value;
  }
  return memory;
};

// The same JSON as the stored state, for the names of a workspace: { [workspaceId]: Memory }
export const readMemoryMap = (raw: unknown): Record<string, Memory> => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const map: Record<string, Memory> = {};
  for (const [id, memory] of Object.entries(raw as Record<string, unknown>)) {
    const clean = readMemory(memory);
    if (Object.keys(clean).length) map[id] = clean;
  }
  return map;
};

// Checks the limits before a value is remembered. Returns the message for the run to fail with, or undefined.
export const memoryProblem = (memory: Memory, name: string, value: unknown): string | undefined => {
  if (!name) return 'remember needs a name';
  if (name === '__proto__') return 'remember: this name cannot be used';
  if (!isJsonValue(value)) return `remember ${name}: only numbers, text, true or false, lists and objects can be remembered`;
  const isNew = !Object.prototype.hasOwnProperty.call(memory, name);
  if (isNew && Object.keys(memory).length >= MAX_MEMORY_NAMES) {
    return `remember ${name}: a workspace can remember at most ${MAX_MEMORY_NAMES} names`;
  }
  if (memoryBytes({ ...memory, [name]: value }) > MAX_MEMORY_BYTES) {
    return `remember ${name}: the remembered values of this workspace would be over ${MAX_MEMORY_BYTES / 1024} KB`;
  }
  return undefined;
};
