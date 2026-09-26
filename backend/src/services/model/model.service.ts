import { ModelAdapter } from './model.adapter';
import { MockModel } from './mock-model';
import { NormalizedAIOutput } from '../../types/ai.types';

export class ModelService {
  private adapter: ModelAdapter;

  constructor(adapter?: ModelAdapter) {
    this.adapter = adapter || new MockModel();
  }

  /**
   * Swap the model adapter implementation (e.g., MockModel -> RealModelAdapter)
   */
  public setAdapter(adapter: ModelAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Run retinal scan analysis via current adapter
   */
  public async analyzeRetinalScan(imagePath: string): Promise<NormalizedAIOutput> {
    return this.adapter.analyze(imagePath);
  }
}

// Export singleton instance
export const modelService = new ModelService();
