'use client';

import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, Puzzle, RefreshCw, Play, ArrowLeft } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { getGamesByDomain } from '@/lib/utils/games';
import { DOMAIN_COLORS, DOMAIN_LABELS, type CognitiveDomain } from '@/types';

const domainIcons: Record<CognitiveDomain, React.ElementType> = {
  memory: Brain,
  attention: Target,
  speed: Zap,
  problem_solving: Puzzle,
  flexibility: RefreshCw,
};

const domainDescriptions: Record<CognitiveDomain, string> = {
  memory: 'Train your working memory, pattern recognition, and recall abilities.',
  attention: 'Improve focus, concentration, and your ability to filter distractions.',
  speed: 'Boost your processing speed and reaction time.',
  problem_solving: 'Enhance logical reasoning, planning, and analytical thinking.',
  flexibility: 'Develop cognitive flexibility and the ability to switch between tasks.',
};

// Map URL slugs to domain keys
const slugToDomain: Record<string, CognitiveDomain> = {
  'memory': 'memory',
  'attention': 'attention',
  'speed': 'speed',
  'problem-solving': 'problem_solving',
  'flexibility': 'flexibility',
};

const validDomains = Object.keys(slugToDomain);

export default function DomainGamesPage() {
  const params = useParams();
  const domainSlug = params.domain as string;

  // Check if it's a valid domain
  if (!validDomains.includes(domainSlug)) {
    notFound();
  }

  const domain = slugToDomain[domainSlug];
  const games = getGamesByDomain(domain);
  const Icon = domainIcons[domain];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Link */}
      <Link
        href="/games"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Games
      </Link>

      {/* Domain Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${DOMAIN_COLORS[domain]}20` }}
          >
            <Icon
              className="w-7 h-7"
              style={{ color: DOMAIN_COLORS[domain] }}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {DOMAIN_LABELS[domain]}
            </h1>
            <p className="text-gray-400">{games.length} games available</p>
          </div>
        </div>
        <p className="text-gray-300 max-w-2xl">
          {domainDescriptions[domain]}
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, gameIndex) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gameIndex * 0.05 }}
          >
            <Link href={`/games/${game.id}`}>
              <Card
                hoverable
                className="h-full border border-navy-600 hover:border-electric-500/50 transition-all"
              >
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${DOMAIN_COLORS[domain]}15` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: DOMAIN_COLORS[domain] }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-1.5 h-1.5 rounded-full ${
                            level <= 3 ? 'bg-electric-500' : 'bg-navy-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-white font-semibold mb-1">
                    {game.name}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {game.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    icon={<Play className="w-4 h-4" />}
                  >
                    Play
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
