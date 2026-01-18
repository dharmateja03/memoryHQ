import type { CognitiveDomain, GameConfig } from '@/types';

// Game IDs must match GAME_COMPONENTS in [gameId]/page.tsx
export const GAMES: GameConfig[] = [
  // MEMORY DOMAIN
  {
    id: 'memory-matrix',
    name: 'Memory Matrix',
    description: 'Remember and reproduce sequences of highlighted squares.',
    domain: 'memory',
    instructions: 'Watch the squares light up in sequence, then tap them in the same order.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'memory-span',
    name: 'Memory Span',
    description: 'Remember and recall increasingly long sequences.',
    domain: 'memory',
    instructions: 'Memorize the sequence shown, then reproduce it correctly.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'n-back',
    name: 'N-Back',
    description: 'The gold standard of working memory training.',
    domain: 'memory',
    instructions: 'Press when the current item matches what appeared N turns ago.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'word-recall',
    name: 'Word Recall',
    description: 'Remember words from a list and identify them later.',
    domain: 'memory',
    instructions: 'Study the word list carefully. Later, identify which words were on the original list.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'spatial-memory',
    name: 'Spatial Memory',
    description: 'Remember the locations of objects in space.',
    domain: 'memory',
    instructions: 'Memorize the positions of objects, then recall their locations.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'visual-pairs',
    name: 'Visual Pairs',
    description: 'Find matching pairs of cards using your memory.',
    domain: 'memory',
    instructions: 'Flip cards to find matching pairs. Remember card positions to make matches efficiently.',
    difficulty: 1,
    practiceAvailable: true,
  },

  // ATTENTION DOMAIN
  {
    id: 'stroop-test',
    name: 'Stroop Test',
    description: 'Classic attention and inhibition test. Identify ink colors, not words.',
    domain: 'attention',
    instructions: 'Select the INK COLOR of each word, ignoring what the word says.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'visual-search',
    name: 'Visual Search',
    description: 'Find target items quickly among distractors.',
    domain: 'attention',
    instructions: 'Find and tap all instances of the target item as quickly as possible.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'sustained-attention',
    name: 'Sustained Attention',
    description: 'Maintain focus and respond to rare targets.',
    domain: 'attention',
    instructions: 'Tap only when you see the target sequence. Stay vigilant!',
    difficulty: 1,
    duration: 180,
    practiceAvailable: true,
  },
  {
    id: 'divided-attention',
    name: 'Divided Attention',
    description: 'Track multiple things simultaneously.',
    domain: 'attention',
    instructions: 'Track the moving objects while responding to events in different areas.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'flanker-task',
    name: 'Flanker Task',
    description: 'Focus on the center while ignoring distractions.',
    domain: 'attention',
    instructions: 'Indicate the direction of the CENTER arrow only. Ignore the surrounding arrows.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'change-detection',
    name: 'Change Detection',
    description: 'Spot changes between two images.',
    domain: 'attention',
    instructions: 'Find what changed between the two images shown.',
    difficulty: 1,
    practiceAvailable: true,
  },

  // PROCESSING SPEED DOMAIN
  {
    id: 'simple-reaction',
    name: 'Simple Reaction',
    description: 'Test your raw reaction speed.',
    domain: 'speed',
    instructions: 'Tap as fast as possible when the target appears.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'choice-reaction',
    name: 'Choice Reaction',
    description: 'Speed with decision-making.',
    domain: 'speed',
    instructions: 'Quickly select the correct response based on what appears.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'rapid-visual',
    name: 'Rapid Visual Processing',
    description: 'Process rapidly presented visual information.',
    domain: 'speed',
    instructions: 'Detect target items from the rapidly flashing images.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'symbol-matching',
    name: 'Symbol Matching',
    description: 'Rapidly identify if symbols match.',
    domain: 'speed',
    instructions: 'Quickly decide if the symbols shown are the SAME or DIFFERENT.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'color-tap',
    name: 'Color Tap',
    description: 'Tap colors as fast as possible.',
    domain: 'speed',
    instructions: 'Tap the correct color as quickly as you can.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'motion-tracking',
    name: 'Motion Tracking',
    description: 'Track moving objects accurately.',
    domain: 'speed',
    instructions: 'Keep track of the highlighted objects as they move.',
    difficulty: 1,
    practiceAvailable: true,
  },

  // PROBLEM SOLVING DOMAIN
  {
    id: 'number-series',
    name: 'Number Series',
    description: 'Find patterns and predict the next number.',
    domain: 'problem_solving',
    instructions: 'Identify the pattern in the number sequence and select what comes next.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'matrix-reasoning',
    name: 'Matrix Reasoning',
    description: 'Find the missing piece in visual patterns.',
    domain: 'problem_solving',
    instructions: 'Identify the pattern and select the missing piece.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'tower-of-hanoi',
    name: 'Tower of Hanoi',
    description: 'Classic planning puzzle. Move disks with strategy.',
    domain: 'problem_solving',
    instructions: 'Move all disks to the last peg. Only move one disk at a time, and never place a larger disk on a smaller one.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'pattern-completion',
    name: 'Pattern Completion',
    description: 'Complete visual patterns.',
    domain: 'problem_solving',
    instructions: 'Select the correct piece to complete the pattern.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'logical-deduction',
    name: 'Logical Deduction',
    description: 'Solve logic puzzles using deductive reasoning.',
    domain: 'problem_solving',
    instructions: 'Use the clues to figure out the correct answer.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'spatial-reasoning',
    name: 'Spatial Reasoning',
    description: 'Identify rotated vs mirrored shapes.',
    domain: 'problem_solving',
    instructions: 'Determine which shapes are rotations of the reference (same) vs mirror images (different).',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'n-queens',
    name: 'N-Queens',
    description: 'Place N queens on an NxN board so none attack each other.',
    domain: 'problem_solving',
    instructions: 'Place queens on the board such that no two queens can attack each other horizontally, vertically, or diagonally.',
    difficulty: 1,
    practiceAvailable: true,
  },

  // COGNITIVE FLEXIBILITY DOMAIN
  {
    id: 'task-switching',
    name: 'Task Switching',
    description: 'Rapidly switch between different rules.',
    domain: 'flexibility',
    instructions: 'Follow the current rule shown. Rules will change - adapt quickly!',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'category-switching',
    name: 'Category Switching',
    description: 'Alternate between categorization criteria.',
    domain: 'flexibility',
    instructions: 'Categorize items by the indicated dimension. Categories alternate!',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'reverse-stroop',
    name: 'Reverse Stroop',
    description: 'Do the opposite of the normal Stroop test.',
    domain: 'flexibility',
    instructions: 'Read the WORD, ignoring its color.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'wisconsin-card',
    name: 'Wisconsin Card Sort',
    description: 'Discover and adapt to changing rules.',
    domain: 'flexibility',
    instructions: 'Sort cards by the hidden rule. The rule will change - figure it out from feedback!',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'trail-making',
    name: 'Trail Making',
    description: 'Alternate between sequences.',
    domain: 'flexibility',
    instructions: 'Connect in order, alternating between numbers and letters: 1-A-2-B-3-C...',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'verbal-fluency',
    name: 'Verbal Fluency',
    description: 'Generate words based on criteria.',
    domain: 'flexibility',
    instructions: 'Think of as many words as you can that fit the given criteria.',
    difficulty: 1,
    duration: 60,
    practiceAvailable: true,
  },
];

export function getGamesByDomain(domain: CognitiveDomain): GameConfig[] {
  return GAMES.filter(game => game.domain === domain);
}

export function getGameById(id: string): GameConfig | undefined {
  return GAMES.find(game => game.id === id);
}

export function getAssessmentGames(): GameConfig[] {
  // Return 2 games per domain for assessment (10 total)
  const assessmentGameIds = [
    'memory-matrix', 'memory-span',             // Memory
    'stroop-test', 'visual-search',             // Attention
    'simple-reaction', 'symbol-matching',       // Speed
    'number-series', 'spatial-reasoning',       // Problem Solving
    'task-switching', 'category-switching',     // Flexibility
  ];
  return assessmentGameIds.map(id => getGameById(id)!).filter(Boolean);
}
