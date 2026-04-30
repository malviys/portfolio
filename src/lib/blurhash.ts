import { decode } from "blurhash";

const toBase64 = (value: string): string => {
  if (typeof window === "undefined") {
    return Buffer.from(value).toString("base64");
  }

  return window.btoa(value);
};

export const blurHashToDataURL = (blurHash: string, width = 32, height = 32): string => {
  const pixels = decode(blurHash, width, height);
  let svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'>`;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const alpha = pixels[index + 3] / 255;

      svg += `<rect x='${x}' y='${y}' width='1' height='1' fill='rgba(${red},${green},${blue},${alpha.toFixed(3)})'/>`;
    }
  }

  svg += "</svg>";

  return `data:image/svg+xml;base64,${toBase64(svg)}`;
};
