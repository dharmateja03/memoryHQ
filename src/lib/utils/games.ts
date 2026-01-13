import type { CognitiveDomain, GameConfig } from '@/types';

export const GAMES: GameConfig[] = [
  // MEMORY DOMAIN
  {
    id: 'dual-n-back',
    name: 'Dual N-Back',
    description: 'The gold standard of working memory training. Track positions and letters simultaneously.',
    domain: 'memory',
    instructions: 'Watch the grid and listen for letters. Press when the current position or letter matches what appeared N turns ago.',
    difficulty: 1,
    practiceAvailable: true,
  },
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
    id: 'card-match',
    name: 'Card Match',
    description: 'Find matching pairs of cards using your memory.',
    domain: 'memory',
    instructions: 'Flip cards to find matching pairs. Remember card positions to make matches efficiently.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'number-recall',
    name: 'Number Recall',
    description: 'Remember and recall increasingly long number sequences.',
    domain: 'memory',
    instructions: 'Memorize the number sequence shown, then enter it correctly.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'word-list',
    name: 'Word List Memory',
    description: 'Remember words from a list and identify them later.',
    domain: 'memory',
    instructions: 'Study the word list carefully. Later, identify which words were on the original list.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'face-name',
    name: 'Face-Name Association',
    description: 'Remember names associated with faces.',
    domain: 'memory',
    instructions: 'Study each face and their name. Later, recall the correct name for each face.',
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
    id: 'flanker-task',
    name: 'Flanker Task',
    description: 'Focus on the center while ignoring distractions.',
    domain: 'attention',
    instructions: 'Indicate the direction of the CENTER arrow only. Ignore the surrounding arrows.',
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
    id: 'selective-attention',
    name: 'Selective Attention',
    description: 'Focus on relevant information while filtering irrelevant.',
    domain: 'attention',
    instructions: 'Attend to one stream of information while ignoring the other.',
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
    id: 'symbol-match',
    name: 'Symbol Match',
    description: 'Rapidly identify if symbols match.',
    domain: 'speed',
    instructions: 'Quickly decide if the symbols shown are the SAME or DIFFERENT.',
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
    id: 'number-comparison',
    name: 'Number Comparison',
    description: 'Rapidly compare numbers.',
    domain: 'speed',
    instructions: 'Quickly tap the larger (or smaller) number.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'pattern-completion',
    name: 'Quick Pattern',
    description: 'Rapidly identify missing pattern elements.',
    domain: 'speed',
    instructions: 'Quickly select the correct piece to complete the pattern.',
    difficulty: 1,
    practiceAvailable: true,
  },

  // PROBLEM SOLVING DOMAIN
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
    id: 'logic-grid',
    name: 'Logic Grid',
    description: 'Deductive reasoning puzzles.',
    domain: 'problem_solving',
    instructions: 'Use the clues to figure out the correct arrangement.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'mental-rotation',
    name: 'Mental Rotation',
    description: 'Identify rotated vs mirrored shapes.',
    domain: 'problem_solving',
    instructions: 'Determine which shapes are rotations of the reference (same) vs mirror images (different).',
    difficulty: 1,
    practiceAvailable: true,
  },
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
    id: 'syllogism',
    name: 'Syllogism',
    description: 'Evaluate logical arguments.',
    domain: 'problem_solving',
    instructions: 'Determine if the conclusion logically follows from the premises.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'path-finding',
    name: 'Path Finding',
    description: 'Plan optimal routes through grids.',
    domain: 'problem_solving',
    instructions: 'Find the shortest path from start to end, avoiding obstacles.',
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
    id: 'wisconsin-card',
    name: 'Card Sort',
    description: 'Discover and adapt to changing rules.',
    domain: 'flexibility',
    instructions: 'Sort cards by the hidden rule. The rule will change - figure it out from feedback!',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'category-switch',
    name: 'Category Switch',
    description: 'Alternate between categorization criteria.',
    domain: 'flexibility',
    instructions: 'Categorize items by the indicated dimension. Categories alternate!',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'reverse-commands',
    name: 'Reverse Commands',
    description: 'Do the opposite of what you see.',
    domain: 'flexibility',
    instructions: 'Do the OPPOSITE of the instruction shown.',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'alphabet-number',
    name: 'Trail Making',
    description: 'Alternate between sequences.',
    domain: 'flexibility',
    instructions: 'Connect in order, alternating between numbers and letters: 1-A-2-B-3-C...',
    difficulty: 1,
    practiceAvailable: true,
  },
  {
    id: 'creative-uses',
    name: 'Creative Uses',
    description: 'Generate creative uses for objects.',
    domain: 'flexibility',
    instructions: 'Think of as many creative uses for the object as you can!',
    difficulty: 1,
    duration: 60,
    practiceAvailable: false,
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
    'memory-matrix', 'number-recall',           // Memory
    'stroop-test', 'visual-search',             // Attention
    'simple-reaction', 'symbol-match',          // Speed
    'number-series', 'mental-rotation',         // Problem Solving
    'task-switching', 'category-switch',        // Flexibility
  ];
  return assessmentGameIds.map(id => getGameById(id)!).filter(Boolean);
}
