/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AdBannerProps {
  adSlot?: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  fullWidthResponsive?: boolean;
  className?: string;
}

/**
 * AdBanner Component
 * Compliant with AdSense guidelines:
 * Does NOT render fake ads, simulated placeholders, or unapproved ad units.
 * Google Auto-Ads (via global <head> script) automatically handles valid ad placements.
 */
export default function AdBanner(_props: AdBannerProps) {
  // Per Google AdSense policy during review: No dummy ad units, no fake ads or placeholders.
  return null;
}
