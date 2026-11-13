import React, { useState } from 'react';
import { ComplaintComment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { addComment } from '@/services/complaintService';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime } from '@/lib/utils';
import { MessageSquare, Send, ShieldCheck, User } from 'lucide-react';

interface CommentThreadProps {
  complaintId: string;
  initialComments: ComplaintComment[];
  onCommentAdded?: () => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  complaintId,
  initialComments,
  onCommentAdded,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<ComplaintComment[]>(initialComments);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setIsSubmitting(true);
    setError(null);

    const { data, error: submitError } = await addComment({
      complaintId,
      authorId: user.id,
      message: message.trim(),
      authorName: user.full_name,
      authorRole: user.role,
    });

    setIsSubmitting(false);

    if (submitError || !data) {
      setError(submitError || 'Failed to post comment.');
      return;
    }

    setComments((prev) => [...prev, data]);
    setMessage('');
    if (onCommentAdded) onCommentAdded();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          Follow-up Discussion ({comments.length})
        </h3>
        <span className="text-xs text-slate-400">Official student-admin record</span>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No comments posted yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Both student and campus administration can post updates here.
            </p>
          </div>
        ) : (
          comments.map((c) => {
            const isAdmin = c.author_profile?.role === 'admin';
            const isSelf = c.author_id === user?.id;

            return (
              <div
                key={c.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isAdmin
                    ? 'bg-blue-50/60 border-blue-100'
                    : isSelf
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        isAdmin ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                      }`}
                    >
                      {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {c.author_profile?.full_name || 'Campus Member'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border uppercase tracking-wide ${
                        isAdmin
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {c.author_profile?.role || 'User'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatRelativeTime(c.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-wrap pl-8 leading-relaxed">
                  {c.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Add a follow-up response as ${user.full_name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50"
            />
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!message.trim()}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </div>
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </form>
      ) : (
        <p className="text-xs text-slate-400 text-center italic">
          Log in to contribute to this discussion.
        </p>
      )}
    </div>
  );
};
