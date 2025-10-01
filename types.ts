/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// FIX: Import React to resolve namespace errors for React types.
import type React from 'react';

export type ToolId = 'restoration' | 'id-photo' | 'product' | 'remove-object' | 'office-photo';

export interface Tool {
  id: ToolId;
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isAvailable: boolean;
}

// FIX: Define and export WardrobeItem interface used in multiple components.
export interface WardrobeItem {
  id: string;
  name: string;
  url: string;
}

// FIX: Define and export OutfitLayer interface used in CurrentOutfitPanel.
export interface OutfitLayer {
  garment?: WardrobeItem;
}
