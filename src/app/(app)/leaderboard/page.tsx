import { verifySession } from "@/lib/dal";
import { getLeaderboardAction } from "@/app/actions/gamification";
import { LeaderboardView } from "@/components/LeaderboardView";
import { PageHeader } from "@/components/PageHeader";

export default async function LeaderboardPage() {
  const { userId } = await verifySession();
  const { xpLeaderboard, streakLeaderboard } = await getLeaderboardAction();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Leaderboard"
        subtitle="Compete with other learners, keep streaks active, and climb the ranks."
      />
      <LeaderboardView
        currentUserId={userId}
        xpLeaderboard={xpLeaderboard}
        streakLeaderboard={streakLeaderboard}
      />
    </div>
  );
}
