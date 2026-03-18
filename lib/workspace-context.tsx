/**
 * lib/workspace-context.tsx
 *
 * Client-side context for tracking current workspace (personal or team).
 * Persists selection in localStorage. All expense/budget queries should
 * consult this to scope data appropriately.
 */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export interface PersonalWorkspace {
  type: "personal";
}

export interface TeamWorkspace {
  type: "team";
  teamId: string;
  teamName: string;
  role: string;
}

export type Workspace = PersonalWorkspace | TeamWorkspace;

interface WorkspaceContextType {
  workspace: Workspace;
  switchWorkspace: (ws: Workspace) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: { type: "personal" },
  switchWorkspace: () => {},
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>({ type: "personal" });

  // Restore from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("trackr-workspace");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.type === "team" && parsed.teamId) {
          setWorkspace(parsed);
        }
      }
    } catch {
      // ignore corrupted data
    }
  }, []);

  function switchWorkspace(ws: Workspace) {
    setWorkspace(ws);
    localStorage.setItem("trackr-workspace", JSON.stringify(ws));
  }

  return (
    <WorkspaceContext.Provider value={{ workspace, switchWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
