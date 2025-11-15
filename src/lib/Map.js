// @ts-nocheck

import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

maptilersdk.config.apiKey = 'meJ81d0wIYGBeFSm8QV4';

export default function createMap(container) {
  // container can be an element or an id string
  const map = new maptilersdk.Map({
    container, // element or id
    style: maptilersdk.MapStyle.SATELLITE,
    // center: [8.94738, 45.97812],
    // zoom: 14,
    projection: 'globe',
    terrain: true,
    terrainControl: true,
    // halo: true,
    space: {
      preset: "milkyway-bright",
    },
    
  });

  return map;
}