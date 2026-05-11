// Drawing style presets — same values as original, clean naming

export const WEIGHT_MAP = [2, 4, 8];

export const COLOR_MAP = [
  '#F3413F',
  '#FFBD2F',
  '#37B44B',
  '#2065EC',
  '#000000',
  '#848A93',
  '#FFFFFF',
];

export const FONT_SIZE_MAP = [12, 16, 24, 36, 48, 60];

export const DEFAULT_DRAWING_STYLE = {
  color: COLOR_MAP[0],
  weight: WEIGHT_MAP[0],
  fontSize: FONT_SIZE_MAP[2], // 24
};

// Default canvas dimensions (not mutated globally — constructed per instance)
export const DEFAULT_CANVAS_WIDTH = 1920;
export const DEFAULT_CANVAS_HEIGHT = 1080;