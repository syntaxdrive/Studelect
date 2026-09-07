"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { MockElection } from "../mock-data";

/**
 * Supabase Realtime Hook for Live Election Results & Turnout Telemetry
 * Automatically listens for new INSERT events on the "ballots" table
 */
export function useLiveElection(initialElection: MockElection) {
  const [election, setElection] = useState<MockElection>(initialElection);
  const [liveBallotCount, setLiveBallotCount] = useState(initialElection?.totalBallotsCast || 0);
  const [lastCastReceipt, setLastCastReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (initialElection) {
      setElection(initialElection);
      setLiveBallotCount(initialElection.totalBallotsCast || 0);
    }
  }, [initialElection?.id, initialElection?.totalBallotsCast]);

  useEffect(() => {
    if (!election?.id) return;

    // Connect to Supabase Realtime Channel
    const channel = supabase
      .channel(`election-${election.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ballots",
          filter: `electionId=eq.${election.id}`,
        },
        (payload) => {
          const newBallot = payload.new as {
            receiptHash: string;
            selections: Array<{ postId: string; candidateId: string }>;
          };

          setLiveBallotCount((prev) => prev + 1);
          setLastCastReceipt(newBallot?.receiptHash || null);

          // Increment vote counts for chosen candidates in memory
          if (newBallot?.selections && Array.isArray(newBallot.selections)) {
            setElection((prevElection) => {
              if (!prevElection) return prevElection;
              const updatedPosts = (prevElection.posts || []).map((post) => {
                const sel = newBallot.selections.find((s) => s.postId === post.id);
                if (!sel) return post;

                return {
                  ...post,
                  candidates: (post.candidates || []).map((cand) =>
                    cand.id === sel.candidateId
                      ? { ...cand, votes: (cand.votes || 0) + 1 }
                      : cand
                  ),
                };
              });

              return {
                ...prevElection,
                totalBallotsCast: (prevElection.totalBallotsCast || 0) + 1,
                posts: updatedPosts,
              };
            });
          }
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [election?.id]);

  return {
    election,
    liveBallotCount,
    lastCastReceipt,
  };
}
