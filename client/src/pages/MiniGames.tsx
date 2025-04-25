import MiniGameCard from "@/components/minigames/MiniGameCard";

interface MiniGamesProps {
  userId: number;
}

export default function MiniGames({ userId }: MiniGamesProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Mini-Games</h1>
        <p className="text-gray-600">
          Play these brain-training games to earn extra coins while improving your cognitive skills.
        </p>
      </div>

      <div className="space-y-4">
        <MiniGameCard
          title="Memory Match"
          description="Test your memory skills by matching pairs of cards"
          icon="Brain"
          color="primary"
          maxCoins={20}
          gameType="memory"
        />
        
        <MiniGameCard
          title="Reaction Time"
          description="Test your reflexes by clicking as fast as you can"
          icon="Zap"
          color="secondary"
          maxCoins={15}
          gameType="reaction"
        />
      </div>
    </div>
  );
}
