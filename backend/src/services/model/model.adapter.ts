import { NormalizedAIOutput } from '../../types/ai.types';

/**
 * ModelAdapter interface:
 * Decouples the application backend from any underlying AI implementation
 * (MockModel now, Python/PyTorch inference service in the future).
 */
export interface ModelAdapter {
  /**
   * Run diabetic retinopathy and lesion analysis on a retinal fundus image.
   * @param imagePath Absolute or relative filesystem path of the uploaded retinal scan.
   * @returns Standardized, normalized AI screening output.
   */
  analyze(imagePath: string): Promise<NormalizedAIOutput>;
}
