import { memo, useMemo } from 'react';
import { renderAssetMarkup } from '../../lib/svgParser.js';

/** Renders an asset (with optional colour overrides) fitted in a square box. */
function AssetThumb({ asset, colors, className = 'h-20 w-20', idPrefix }) {
  const html = useMemo(() => {
    if (!asset) return '';
    const inner = renderAssetMarkup(asset, colors, idPrefix || `t-${asset.id}`);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${asset.width} ${asset.height}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
  }, [asset, colors, idPrefix]);
  return <div className={`thumb ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default memo(AssetThumb);
