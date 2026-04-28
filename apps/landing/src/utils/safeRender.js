// Defensive check - ensure we never render objects
function safeRender(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map(safeRender).join(', ');
  // Object - return empty string to prevent React error #31
  console.warn('Attempted to render object:', value);
  return '';
}

export default safeRender;