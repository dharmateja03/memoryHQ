'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, Puzzle, RefreshCw, Play } from 'lucide-react';
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

const domains: CognitiveDomain[] = ['memory', 'attention', 'speed', 'problem_solving', 'flexibility'];

export default function GamesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          All Games
        </h1>
        <p className="text-gray-400">
          30 brain training games across 5 cognitive domains
        </p>
      </div>

      <div className="space-y-12">
        {domains.map((domain, domainIndex) => {
          const Icon = domainIcons[domain];
          const games = getGamesByDomain(domain);

          return (
            <motion.section
              key={domain}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: domainIndex * 0.1 }}
            >
              {/* Domain Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${DOMAIN_COLORS[domain]}20` }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: DOMAIN_COLORS[domain] }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {DOMAIN_LABELS[domain]}
                  </h2>
                  <p className="text-sm text-gray-500">{games.length} games</p>
                </div>
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game, gameIndex) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: domainIndex * 0.1 + gameIndex * 0.05 }}
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
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
