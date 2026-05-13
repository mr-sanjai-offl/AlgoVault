import { z } from 'zod';

export const ApproachSchema = z.object({
  thoughtProcess: z.object({
    initialReaction: z.string(),
    keyObservations: z.array(z.string()),
  }),
  bruteForce: z.object({
    description: z.string(),
    codeSketch: z.string(),
    whyInsufficient: z.string(),
  }),
  optimizationInsight: z.object({
    keyInsight: z.string(),
    patternUsed: z.string(),
    dataStructure: z.string(),
  }),
  finalAlgorithm: z.object({
    stepByStep: z.array(z.string()),
    pseudocode: z.string(),
  }),
  dryRun: z.object({
    example: z.string(),
    walkthrough: z.string(),
  }),
  complexityAnalysis: z.object({
    time: z.string(),
    timeProof: z.string(),
    space: z.string(),
    spaceProof: z.string(),
  }),
  keyConcepts: z.array(z.string()),
  commonMistakes: z.array(z.string()),
  interviewNotes: z.object({
    fiveMinuteExplanation: z.string(),
    followUpQuestions: z.array(z.string()),
  }),
  edgeCases: z.array(z.string()),
});

export type ApproachData = z.infer<typeof ApproachSchema>;

export function getSchemaString(): string {
  return JSON.stringify({
    thoughtProcess: { initialReaction: 'string', keyObservations: ['string'] },
    bruteForce: { description: 'string', codeSketch: 'string', whyInsufficient: 'string' },
    optimizationInsight: { keyInsight: 'string', patternUsed: 'string', dataStructure: 'string' },
    finalAlgorithm: { stepByStep: ['string'], pseudocode: 'string' },
    dryRun: { example: 'string', walkthrough: 'string' },
    complexityAnalysis: { time: 'string', timeProof: 'string', space: 'string', spaceProof: 'string' },
    keyConcepts: ['string'],
    commonMistakes: ['string'],
    interviewNotes: { fiveMinuteExplanation: 'string', followUpQuestions: ['string'] },
    edgeCases: ['string'],
  }, null, 2);
}
