/**
 * components/team/TeamActivityFeed.tsx
 *
 * Real-time activity log for team workspace.
 */
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  UserPlus,
  UserCheck,
  UserMinus,
  Shield,
  Target,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface Activity {
  id: string;
  action: string;
  description: string;
  userName: string | null;
  userEmail: string;
  createdAt: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  EXPENSE_ADDED: <Plus className="h-4 w-4 text-green-500" />,
  EXPENSE_EDITED: <Edit className="h-4 w-4 text-blue-500" />,
  EXPENSE_DELETED: <Trash2 className="h-4 w-4 text-red-500" />,
  MEMBER_INVITED: <UserPlus className="h-4 w-4 text-purple-500" />,
  MEMBER_JOINED: <UserCheck className="h-4 w-4 text-green-500" />,
  MEMBER_LEFT: <UserMinus className="h-4 w-4 text-amber-500" />,
  MEMBER_REMOVED: <UserMinus className="h-4 w-4 text-red-500" />,
  ROLE_CHANGED: <Shield className="h-4 w-4 text-blue-500" />,
  BUDGET_CREATED: <Target className="h-4 w-4 text-indigo-500" />,
  BUDGET_UPDATED: <Target className="h-4 w-4 text-indigo-500" />,
  CATEGORY_ADDED: <Tag className="h-4 w-4 text-teal-500" />,
  APPROVAL_REQUESTED: <Clock className="h-4 w-4 text-amber-500" />,
  APPROVAL_GRANTED: <CheckCircle className="h-4 w-4 text-green-500" />,
  APPROVAL_REJECTED: <XCircle className="h-4 w-4 text-red-500" />,
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function TeamActivityFeed({ teamId }: { teamId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/activity`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setActivities(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No activity yet. Actions will appear here as team members interact.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-muted/50"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            {actionIcons[activity.action] || (
              <Plus className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">
              {timeAgo(activity.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
