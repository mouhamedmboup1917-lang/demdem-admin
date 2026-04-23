// This file is kept for backwards compatibility.
// The logic has been split into:
//   - @/context/RoleContext.jsx   → state & hook
//   - @/components/Sidebar.jsx   → UI
//   - @/components/AdminShell.jsx → layout composition
export { default as RoleProvider, useRole } from '@/context/RoleContext';
