'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, Clock, Target, Zap, Puzzle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button, Card, CardContent, Progress } from '@/components/ui';
import { RadarChart } from '@/components/ui/RadarChart';
import { DOMAIN_COLORS, DOMAIN_LABELS, type CognitiveDomain } from '@/types';
import { getAssessmentGames } from '@/lib/utils/games';

const domainIcons: Record<CognitiveDomain, React.ElementType> = {
  memory: Brain,
  attention: Target,
  speed: Zap,
  problem_solving: Puzzle,
  flexibility: RefreshCw,
};

type AssessmentStep = 'intro' | 'testing' | 'results';

interface DomainResult {
  domain: CognitiveDomain;
  score: number;
  difficulty: number;
}

export default function AssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState<AssessmentStep>('intro');
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [_results, setResults] = useState<DomainResult[]>([]);

  const assessmentGames = getAssessmentGames();
  const totalGames = assessmentGames.length;

  // Mock completed results for demo
  const mockResults: DomainResult[] = [
    { domain: 'memory', score: 72, difficulty: 4 },
    { domain: 'attention', score: 65, difficulty: 3 },
    { domain: 'speed', score: 81, difficulty: 5 },
    { domain: 'problem_solving', score: 58, difficulty: 3 },
    { domain: 'flexibility', score: 69, difficulty: 4 },
  ];

  const overallScore = Math.round(
    mockResults.reduce((acc, r) => acc + r.score, 0) / mockResults.length
  );

  const strongestDomain = mockResults.reduce((max, r) =>
    r.score > max.score ? r : max
  );

  const weakestDomain = mockResults.reduce((min, r) =>
    r.score < min.score ? r : min
  );

  const handleStartAssessment = () => {
    setStep('testing');
  };

  const handleCompleteGame = () => {
    if (currentGameIndex < totalGames - 1) {
      setCurrentGameIndex(currentGameIndex + 1);
    } else {
      setResults(mockResults);
      setStep('results');
    }
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <AnimatePresence mode="wait">
        {/* Intro Step */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="max-w-2xl w-full">
              <Card className="text-center">
                <CardContent className="py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-6 bg-electric-500/10 rounded-2xl flex items-center justify-center"
                  >
                    <Brain className="w-10 h-10 text-electric-500" />
                  </motion.div>

                  <h1 className="text-3xl font-bold text-white mb-4">
                    Cognitive Assessment
                  </h1>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Complete this 15-20 minute assessment to discover your unique cognitive profile.
                    We&apos;ll test your abilities across 5 domains.
                  </p>

                  <div className="grid grid-cols-5 gap-3 mb-8">
                    {(['memory', 'attention', 'speed', 'problem_solving', 'flexibility'] as CognitiveDomain[]).map((domain, index) => {
                      const Icon = domainIcons[domain];
                      return (
                        <motion.div
                          key={domain}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex flex-col items-center"
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                            style={{ backgroundColor: `${DOMAIN_COLORS[domain]}20` }}
                          >
                            <Icon className="w-6 h-6" style={{ color: DOMAIN_COLORS[domain] }} />
                          </div>
                          <span className="text-xs text-gray-500 text-center">
                            {DOMAIN_LABELS[domain].split(' ')[0]}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-6 mb-8 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>15-20 min</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Target className="w-4 h-4" />
                      <span>10 mini-tests</span>
                    </div>
                  </div>

                  <Button size="lg" onClick={handleStartAssessment}>
                    Begin Assessment
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Testing Step */}
        {step === 'testing' && (
          <motion.div
            key="testing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen p-4"
          >
            <div className="max-w-4xl mx-auto">
              {/* Progress Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    Test {currentGameIndex + 1} of {totalGames}
                  </span>
                  <span className="text-sm text-gray-400">
                    {Math.round(((currentGameIndex + 1) / totalGames) * 100)}% complete
                  </span>
                </div>
                <Progress value={((currentGameIndex + 1) / totalGames) * 100} size="md" />
              </div>

              {/* Current Game Card */}
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {assessmentGames[currentGameIndex]?.name}
                    </h2>
                    <p className="text-gray-400 mb-8">
                      {assessmentGames[currentGameIndex]?.description}
                    </p>

                    {/* Mock game UI */}
                    <div className="bg-navy-700 rounded-2xl p-12 mb-8">
                      <p className="text-gray-500">Game interface would appear here</p>
                    </div>

                    <Button onClick={handleCompleteGame}>
                      Complete & Continue
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Results Step */}
        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen p-4 py-12"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="w-20 h-20 mx-auto mb-6 bg-success-500/10 rounded-2xl flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-success-500" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  Assessment Complete!
                </h1>
                <p className="text-gray-400">
                  Here&apos;s your cognitive profile based on your performance.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Radar Chart */}
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold text-white mb-6 text-center">
                      Your Cognitive Profile
                    </h3>
                    <div className="flex justify-center">
                      <RadarChart
                        data={mockResults.map(r => ({ domain: r.domain, value: r.score }))}
                        size={280}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold text-white mb-6">
                      Your Results
                    </h3>

                    <div className="space-y-4">
                      {/* Overall Score */}
                      <div className="bg-electric-500/10 rounded-xl p-4 text-center">
                        <div className="text-4xl font-bold text-electric-400 mb-1">
                          {overallScore}
                        </div>
                        <div className="text-sm text-gray-400">Overall Brain Score</div>
                      </div>

                      {/* Strongest */}
                      <div className="bg-success-500/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const Icon = domainIcons[strongestDomain.domain];
                            return <Icon className="w-6 h-6 text-success-400" />;
                          })()}
                          <div>
                            <div className="text-sm text-gray-400">Strongest Area</div>
                            <div className="text-white font-medium">
                              {DOMAIN_LABELS[strongestDomain.domain]} ({strongestDomain.score})
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Weakest */}
                      <div className="bg-warning-500/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const Icon = domainIcons[weakestDomain.domain];
                            return <Icon className="w-6 h-6 text-warning-400" />;
                          })()}
                          <div>
                            <div className="text-sm text-gray-400">Focus Area</div>
                            <div className="text-white font-medium">
                              {DOMAIN_LABELS[weakestDomain.domain]} ({weakestDomain.score})
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Domain Breakdown */}
              <Card className="mb-8">
                <CardContent>
                  <h3 className="text-lg font-semibold text-white mb-6">
                    Domain Scores
                  </h3>
                  <div className="space-y-4">
                    {mockResults.map((result, index) => {
                      const Icon = domainIcons[result.domain];
                      return (
                        <motion.div
                          key={result.domain}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4"
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${DOMAIN_COLORS[result.domain]}20` }}
                          >
                            <Icon
                              className="w-5 h-5"
                              style={{ color: DOMAIN_COLORS[result.domain] }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white font-medium">
                                {DOMAIN_LABELS[result.domain]}
                              </span>
                              <span className="text-gray-400">{result.score}</span>
                            </div>
                            <Progress
                              value={result.score}
                              size="sm"
                              color={`bg-[${DOMAIN_COLORS[result.domain]}]`}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button size="lg" onClick={handleFinish}>
                  Start Training
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
