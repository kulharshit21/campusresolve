import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, MessageSquare, ShieldCheck, X } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'status' | 'comment' | 'system';
  complaintId?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Status Updated: In Progress',
    description: 'Dr. Anita Desai assigned ticket CR-2026-1001 (Wi-Fi Lab 3) to IT Network Engineer.',
    time: '2 hours ago',
    read: false,
    type: 'status',
    complaintId: 'c-101',
  },
  {
    id: 'n-2',
    title: 'New Official Comment',
    description: 'AV technician updated Auditorium Projector status: replacement HDMI box installed.',
    time: '4 hours ago',
    read: false,
    type: 'comment',
    complaintId: 'c-103',
  },
  {
    id: 'n-3',
    title: 'Ticket Resolved',
    description: 'Ticket CR-2026-1003 marked resolved. Resolution verification note filed.',
    time: 'Yesterday',
    read: true,
    type: 'status',
    complaintId: 'c-103',
  },
  {
    id: 'n-4',
    title: 'Campus Advisory',
    description: 'Routine maintenance of overhead water tanks scheduled for Sunday 6 AM - 9 AM.',
    time: '2 days ago',
    read: true,
    type: 'system',
  },
];

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, isAdmin }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = (n: NotificationItem) => {
    // mark read
    setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
    onClose();

    if (n.complaintId) {
      if (isAdmin) {
        navigate(`/admin/complaints/${n.complaintId}`);
      } else {
        navigate(`/student/complaints/${n.complaintId}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm sm:max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                <p className="text-xs text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">No notifications right now.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                    n.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      n.type === 'status'
                        ? 'bg-amber-100 text-amber-700'
                        : n.type === 'comment'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {n.type === 'status' ? (
                      <Clock className="w-4 h-4" />
                    ) : n.type === 'comment' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold truncate ${n.read ? 'text-slate-800' : 'text-blue-950'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.description}</p>
                  </div>

                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Apex University Central Redressal System • Real-Time Alert Engine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
