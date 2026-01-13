'use client';

import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { getGameById } from '@/lib/utils/games';

function GameLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="w-8 h-8 text-electric-500" />
      </motion.div>
    </div>
  );
}

// Memory Games
const MemoryMatrix = dynamic(
  () => import('@/components/games/memory/MemoryMatrix').then(mod => ({ default: mod.MemoryMatrix })),
  { loading: () => <GameLoading /> }
);
const MemorySpan = dynamic(
  () => import('@/components/games/memory/MemorySpan').then(mod => ({ default: mod.MemorySpan })),
  { loading: () => <GameLoading /> }
);
const NBack = dynamic(
  () => import('@/components/games/memory/NBack').then(mod => ({ default: mod.NBack })),
  { loading: () => <GameLoading /> }
);
const WordRecall = dynamic(
  () => import('@/components/games/memory/WordRecall').then(mod => ({ default: mod.WordRecall })),
  { loading: () => <GameLoading /> }
);
const SpatialMemory = dynamic(
  () => import('@/components/games/memory/SpatialMemory').then(mod => ({ default: mod.SpatialMemory })),
  { loading: () => <GameLoading /> }
);
const VisualPairs = dynamic(
  () => import('@/components/games/memory/VisualPairs').then(mod => ({ default: mod.VisualPairs })),
  { loading: () => <GameLoading /> }
);

// Attention Games
const StroopTest = dynamic(
  () => import('@/components/games/attention/StroopTest').then(mod => ({ default: mod.StroopTest })),
  { loading: () => <GameLoading /> }
);
const VisualSearch = dynamic(
  () => import('@/components/games/attention/VisualSearch').then(mod => ({ default: mod.VisualSearch })),
  { loading: () => <GameLoading /> }
);
const SustainedAttention = dynamic(
  () => import('@/components/games/attention/SustainedAttention').then(mod => ({ default: mod.SustainedAttention })),
  { loading: () => <GameLoading /> }
);
const DividedAttention = dynamic(
  () => import('@/components/games/attention/DividedAttention').then(mod => ({ default: mod.DividedAttention })),
  { loading: () => <GameLoading /> }
);
const FlankerTask = dynamic(
  () => import('@/components/games/attention/FlankerTask').then(mod => ({ default: mod.FlankerTask })),
  { loading: () => <GameLoading /> }
);
const ChangeDetection = dynamic(
  () => import('@/components/games/attention/ChangeDetection').then(mod => ({ default: mod.ChangeDetection })),
  { loading: () => <GameLoading /> }
);

// Speed Games
const SimpleReaction = dynamic(
  () => import('@/components/games/speed/SimpleReaction').then(mod => ({ default: mod.SimpleReaction })),
  { loading: () => <GameLoading /> }
);
const ChoiceReaction = dynamic(
  () => import('@/components/games/speed/ChoiceReaction').then(mod => ({ default: mod.ChoiceReaction })),
  { loading: () => <GameLoading /> }
);
const RapidVisual = dynamic(
  () => import('@/components/games/speed/RapidVisual').then(mod => ({ default: mod.RapidVisual })),
  { loading: () => <GameLoading /> }
);
const SymbolMatching = dynamic(
  () => import('@/components/games/speed/SymbolMatching').then(mod => ({ default: mod.SymbolMatching })),
  { loading: () => <GameLoading /> }
);
const ColorTap = dynamic(
  () => import('@/components/games/speed/ColorTap').then(mod => ({ default: mod.ColorTap })),
  { loading: () => <GameLoading /> }
);
const MotionTracking = dynamic(
  () => import('@/components/games/speed/MotionTracking').then(mod => ({ default: mod.MotionTracking })),
  { loading: () => <GameLoading /> }
);

// Problem Solving Games
const NumberSeries = dynamic(
  () => import('@/components/games/problem-solving/NumberSeries').then(mod => ({ default: mod.NumberSeries })),
  { loading: () => <GameLoading /> }
);
const MatrixReasoning = dynamic(
  () => import('@/components/games/problem-solving/MatrixReasoning').then(mod => ({ default: mod.MatrixReasoning })),
  { loading: () => <GameLoading /> }
);
const TowerOfHanoi = dynamic(
  () => import('@/components/games/problem-solving/TowerOfHanoi').then(mod => ({ default: mod.TowerOfHanoi })),
  { loading: () => <GameLoading /> }
);
const PatternCompletion = dynamic(
  () => import('@/components/games/problem-solving/PatternCompletion').then(mod => ({ default: mod.PatternCompletion })),
  { loading: () => <GameLoading /> }
);
const LogicalDeduction = dynamic(
  () => import('@/components/games/problem-solving/LogicalDeduction').then(mod => ({ default: mod.LogicalDeduction })),
  { loading: () => <GameLoading /> }
);
const SpatialReasoning = dynamic(
  () => import('@/components/games/problem-solving/SpatialReasoning').then(mod => ({ default: mod.SpatialReasoning })),
  { loading: () => <GameLoading /> }
);
const NQueens = dynamic(
  () => import('@/components/games/problem-solving/NQueens').then(mod => ({ default: mod.NQueens })),
  { loading: () => <GameLoading /> }
);

// Flexibility Games
const TaskSwitching = dynamic(
  () => import('@/components/games/flexibility/TaskSwitching').then(mod => ({ default: mod.TaskSwitching })),
  { loading: () => <GameLoading /> }
);
const CategorySwitching = dynamic(
  () => import('@/components/games/flexibility/CategorySwitching').then(mod => ({ default: mod.CategorySwitching })),
  { loading: () => <GameLoading /> }
);
const ReverseStroop = dynamic(
  () => import('@/components/games/flexibility/ReverseStroop').then(mod => ({ default: mod.ReverseStroop })),
  { loading: () => <GameLoading /> }
);
const WisconsinCard = dynamic(
  () => import('@/components/games/flexibility/WisconsinCard').then(mod => ({ default: mod.WisconsinCard })),
  { loading: () => <GameLoading /> }
);
const TrailMaking = dynamic(
  () => import('@/components/games/flexibility/TrailMaking').then(mod => ({ default: mod.TrailMaking })),
  { loading: () => <GameLoading /> }
);
const VerbalFluency = dynamic(
  () => import('@/components/games/flexibility/VerbalFluency').then(mod => ({ default: mod.VerbalFluency })),
  { loading: () => <GameLoading /> }
);

function GameNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold text-white mb-2">Game Not Found</h2>
      <p className="text-gray-400 mb-6">This game is not available yet.</p>
      <button
        onClick={() => router.push('/games')}
        className="px-6 py-2 bg-electric-500 hover:bg-electric-400 text-white rounded-xl transition-colors"
      >
        Back to Games
      </button>
    </div>
  );
}

// Map game IDs to components
const GAME_COMPONENTS: Record<string, React.ComponentType<{ difficulty?: number; onExit?: () => void }>> = {
  // Memory
  'memory-matrix': MemoryMatrix,
  'memory-span': MemorySpan,
  'n-back': NBack,
  'word-recall': WordRecall,
  'spatial-memory': SpatialMemory,
  'visual-pairs': VisualPairs,
  // Attention
  'stroop-test': StroopTest,
  'visual-search': VisualSearch,
  'sustained-attention': SustainedAttention,
  'divided-attention': DividedAttention,
  'flanker-task': FlankerTask,
  'change-detection': ChangeDetection,
  // Speed
  'simple-reaction': SimpleReaction,
  'choice-reaction': ChoiceReaction,
  'rapid-visual': RapidVisual,
  'symbol-matching': SymbolMatching,
  'color-tap': ColorTap,
  'motion-tracking': MotionTracking,
  // Problem Solving
  'number-series': NumberSeries,
  'matrix-reasoning': MatrixReasoning,
  'tower-of-hanoi': TowerOfHanoi,
  'pattern-completion': PatternCompletion,
  'logical-deduction': LogicalDeduction,
  'spatial-reasoning': SpatialReasoning,
  'n-queens': NQueens,
  // Flexibility
  'task-switching': TaskSwitching,
  'category-switching': CategorySwitching,
  'reverse-stroop': ReverseStroop,
  'wisconsin-card': WisconsinCard,
  'trail-making': TrailMaking,
  'verbal-fluency': VerbalFluency,
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const gameConfig = getGameById(gameId);

  if (!gameConfig) {
    return <GameNotFound />;
  }

  const GameComponent = GAME_COMPONENTS[gameId];

  if (!GameComponent) {
    return <GameNotFound />;
  }

  const handleExit = () => {
    router.push('/games');
  };

  return (
    <Suspense fallback={<GameLoading />}>
      <GameComponent difficulty={3} onExit={handleExit} />
    </Suspense>
  );
}
