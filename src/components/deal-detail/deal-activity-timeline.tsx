'use client'

import { formatDate } from '@/lib/format'
import type { DealActivity } from '@/lib/types'
import {
  FileText,
  Users,
  Phone,
  Mail,
  File,
  ArrowRightLeft,
  CheckCircle,
} from 'lucide-react'

interface DealActivityTimelineProps {
  activities: DealActivity[]
}

const activityIcons: Record<string, typeof FileText> = {
  note: FileText,
  meeting: Users,
  call: Phone,
  email: Mail,
  document: File,
  stage_change: ArrowRightLeft,
  decision: CheckCircle,
}

export function DealActivityTimeline({ activities }: DealActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/50 text-center py-8">
        No activity recorded yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.activity_type] || FileText
        return (
          <div key={activity.id} className="flex gap-3 items-start">
            <div className="mt-0.5 p-1.5 rounded-md bg-secondary">
              <Icon size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.title}</p>
              {activity.content && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {activity.content}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {formatDate(activity.created_at)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
