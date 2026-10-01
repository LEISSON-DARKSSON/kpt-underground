export interface PreviewAsset {
  readonly width: number;
  readonly height: number;
  readonly sha256: string;
  readonly base64: string;
}
export const PREVIEW_ASSETS: Readonly<Record<string, PreviewAsset>>;
