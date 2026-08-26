import * as React from "react";
import type { PublicApprovedComment } from "@/lib/public-comments";
import { CommentForm } from "@/components/public/comment-form";
import { SplitRule } from "@/components/evidence/split-rule";
import { TopicImprint } from "@/components/evidence/topic-imprint";

interface CommentSectionProps {
  articleId: string;
  comments: PublicApprovedComment[];
}

export function CommentSection({ articleId, comments }: CommentSectionProps) {
  return (
    <section aria-labelledby="discussion-heading" className="space-y-10">
      <SplitRule />

      {/* Section Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2
              id="discussion-heading"
              className="font-serif text-2xl font-medium tracking-tight text-[#242321]"
            >
              Discussion
            </h2>
            <TopicImprint variant="muted">
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </TopicImprint>
          </div>
          <p className="text-xs text-[#5E5953]">
            Professional perspectives and reader commentary on this publication.
          </p>
        </div>
      </div>

      {/* Approved Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="rounded-md border border-[#D2C9BC]/60 bg-[#FFFDF9]/60 p-6 text-center text-xs text-[#5E5953]">
            No public comments yet. Share your thoughtful discussion below.
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const formattedDate = new Date(
                comment.created_at,
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <article
                  key={comment.id}
                  className="rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-5 sm:p-6"
                >
                  <header className="mb-3 flex items-baseline justify-between border-b border-[#E8E2D7] pb-2">
                    <span className="font-sans text-sm font-semibold text-[#242321]">
                      {comment.commenter_name}
                    </span>
                    <time
                      dateTime={comment.created_at}
                      className="font-sans text-xs text-[#7A746B]"
                    >
                      {formattedDate}
                    </time>
                  </header>
                  <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-[#423E3A]">
                    {comment.body}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission Form */}
      <div className="pt-2">
        <CommentForm articleId={articleId} />
      </div>
    </section>
  );
}
