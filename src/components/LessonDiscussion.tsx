"use client";

import React, { useState, useEffect } from "react";
import { useCurrentUser } from "@/lib/user-context";
import {
  getCommentsAction,
  addCommentAction,
  deleteCommentAction,
} from "@/app/actions/discussion";
import { Avatar } from "@/components/Avatar";
import { TrashIcon } from "@/components/icons";

type CommentData = {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    role: string;
  };
};

type LessonDiscussionProps = {
  lessonId: string;
};

export function LessonDiscussion({ lessonId }: LessonDiscussionProps) {
  const user = useCurrentUser();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getCommentsAction(lessonId)
      .then((data) => {
        if (active) {
          setComments(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load comments", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const newComment = await addCommentAction(lessonId, trimmed);
      setComments((prev) => [...prev, newComment]);
      setText("");
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed || replySubmitting) return;

    setReplySubmitting(true);
    try {
      const newComment = await addCommentAction(lessonId, trimmed, parentId);
      setComments((prev) => [...prev, newComment]);
      setReplyText("");
      setReplyingToId(null);
    } catch (err) {
      console.error("Failed to post reply", err);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteCommentAction(commentId);
      // Recursively remove deleted comment and its replies
      setComments((prev) => {
        const toDelete = new Set<string>([commentId]);
        let sizeBefore: number;
        do {
          sizeBefore = toDelete.size;
          prev.forEach((c) => {
            if (c.parentId && toDelete.has(c.parentId)) {
              toDelete.add(c.id);
            }
          });
        } while (toDelete.size !== sizeBefore);

        return prev.filter((c) => !toDelete.has(c.id));
      });
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const formatCommentDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group comments into parent comments and their replies
  const rootComments = comments.filter((c) => !c.parentId);
  const repliesByParentId = new Map<string, CommentData[]>();
  comments.forEach((c) => {
    if (c.parentId) {
      const list = repliesByParentId.get(c.parentId) || [];
      list.push(c);
      repliesByParentId.set(c.parentId, list);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h3 className="text-sm font-bold text-slate-800">Lesson Discussion</h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Discussion List */}
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
        {loading ? (
          <p className="text-xs text-muted py-4 text-center">Loading comments…</p>
        ) : rootComments.length === 0 ? (
          <p className="text-xs text-muted py-6 text-center">
            No comments yet. Start the conversation!
          </p>
        ) : (
          rootComments.map((comment) => {
            const isOwner = comment.user.id === user.id;
            const isAdmin = user.role === "ADMIN";
            const showDelete = isOwner || isAdmin;
            const isAuthorAdmin = comment.user.role === "ADMIN";
            const commentReplies = repliesByParentId.get(comment.id) || [];

            return (
              <div key={comment.id} className="space-y-3">
                {/* Parent Comment */}
                <div className="flex gap-3 bg-surface border border-line rounded-xl p-3.5 shadow-xs">
                  <Avatar name={comment.user.name} size={32} accent={isAuthorAdmin ? "orange" : "navy"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {comment.user.name}
                        </span>
                        {isAuthorAdmin && (
                          <span className="rounded bg-orange-100 text-orange-700 text-[9px] font-extrabold px-1 py-0.5 shrink-0 uppercase tracking-wide">
                            Staff
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted shrink-0">
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => {
                          setReplyingToId(replyingToId === comment.id ? null : comment.id);
                          setReplyText("");
                        }}
                        className="text-[10px] font-semibold text-orange hover:underline transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>

                  {showDelete && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors shrink-0 self-start p-1"
                      title="Delete Comment"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Indented Replies Section */}
                {commentReplies.length > 0 || replyingToId === comment.id ? (
                  <div className="ml-8 border-l-2 border-line/50 pl-4 space-y-3">
                    {/* Render Replies */}
                    {commentReplies.map((reply) => {
                      const isReplyOwner = reply.user.id === user.id;
                      const showReplyDelete = isReplyOwner || isAdmin;
                      const isReplyAuthorAdmin = reply.user.role === "ADMIN";

                      return (
                        <div
                          key={reply.id}
                          className="flex gap-3 bg-surface-muted/50 border border-line/40 rounded-xl p-3"
                        >
                          <Avatar name={reply.user.name} size={28} accent={isReplyAuthorAdmin ? "orange" : "navy"} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs font-bold text-slate-800 truncate">
                                  {reply.user.name}
                                </span>
                                {isReplyAuthorAdmin && (
                                  <span className="rounded bg-orange-100 text-orange-700 text-[9px] font-extrabold px-1 py-0.5 shrink-0 uppercase tracking-wide">
                                    Staff
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-muted shrink-0">
                                {formatCommentDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                              {reply.content}
                            </p>
                          </div>

                          {showReplyDelete && (
                            <button
                              onClick={() => handleDelete(reply.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors shrink-0 self-start p-0.5"
                              title="Delete Reply"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Inline Reply Input Box */}
                    {replyingToId === comment.id && (
                      <form
                        onSubmit={(e) => handleReplySubmit(e, comment.id)}
                        className="flex gap-2 items-start pt-1.5"
                      >
                        <Avatar name={user.name} size={28} accent="navy" />
                        <div className="flex-1 space-y-1.5">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            disabled={replySubmitting}
                            placeholder={`Reply to ${comment.user.name}…`}
                            rows={2}
                            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-navy resize-none"
                            required
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyingToId(null)}
                              className="rounded-md border border-line bg-surface px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={replySubmitting || !replyText.trim()}
                              className="rounded-md bg-navy px-3 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {replySubmitting ? "Posting…" : "Post Reply"}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Post comment form */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-start pt-2 border-t border-line/60">
        <Avatar name={user.name} size={32} accent="navy" />
        <div className="flex-1 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
            placeholder="Ask a question or share your thoughts on this lesson…"
            rows={2}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs outline-none focus:border-navy resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="rounded-lg bg-navy px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
