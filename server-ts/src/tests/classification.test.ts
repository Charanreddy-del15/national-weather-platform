import { AIClassifierService } from '../services/aiClassifier';

describe('AI Classifier Service', () => {
  test('Classifies severe cyclone text correctly', () => {
    const text = 'Deep depression in Bay of Bengal intensified into severe cyclonic storm approaching Visakhapatnam';
    const result = AIClassifierService.classifyText(text);

    expect(result.category).toBe('CYCLONE');
    expect(result.severity).toBeGreaterThanOrEqual(0.85);
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  test('Classifies flood waterlogging correctly', () => {
    const text = 'Incessant monsoon rains causing severe waterlogging and river flooding in low lying areas';
    const result = AIClassifierService.classifyText(text);

    expect(result.category).toBe('FLOOD');
    expect(result.severity).toBeGreaterThanOrEqual(0.75);
  });

  test('Classifies extreme heatwave with temperature override', () => {
    const text = 'Extreme heatwave in Rajasthan with mercury crossing limits';
    const result = AIClassifierService.classifyText(text, { temperature_c: 48.0 });

    expect(result.category).toBe('HEATWAVE');
    expect(result.severity).toBeGreaterThanOrEqual(0.85);
  });
});
