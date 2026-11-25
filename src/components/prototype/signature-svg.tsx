import { cn } from "@/lib/utils";

interface SignatureSvgProps {
  className?: string;
  animated?: boolean;
  mountAnimated?: boolean;
}

/**
 * Custom handwritten cursive SVG signature for "Sourabh Malviya"
 * with continuous Bezier pen paths suitable for GSAP stroke-draw animation.
 */
export function SignatureSvg({
  className,
  animated = false,
  mountAnimated = false,
}: Readonly<SignatureSvgProps>) {
  return (
    <svg
      viewBox="0 0 360 80"
      fill="none"
      aria-label="Sourabh Malviya signature"
      data-gsap-signature={animated ? "true" : undefined}
      data-gsap-signature-mount={mountAnimated ? "true" : undefined}
      className={cn("text-primary", className)}
    >
      {/* "Sourabh" */}
      <path
        d="M 38 20 C 31 12, 17 15, 20 26 C 23 36, 43 34, 41 47 C 39 58, 21 60, 15 51 C 22 46, 36 47, 45 45 C 52 37, 61 38, 60 47 C 59 54, 48 54, 48 46 C 53 45, 62 46, 66 40 C 66 49, 71 54, 77 45 C 78 41, 79 40, 80 49 C 82 53, 86 43, 91 39 C 94 37, 98 38, 97 46 C 97 53, 104 49, 108 42 C 113 36, 120 39, 118 47 C 115 54, 106 52, 108 44 C 114 45, 118 49, 122 44 C 127 34, 134 19, 130 15 C 126 15, 123 39, 125 51 C 127 56, 136 52, 136 44 C 136 39, 130 41, 131 47 C 136 47, 144 34, 149 17 C 145 15, 141 37, 143 52 C 147 44, 153 38, 157 43 C 159 48, 158 53, 166 46"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "Malviya" */}
      <path
        d="M 181 53 C 185 37, 190 21, 194 17 C 197 26, 200 37, 203 44 C 207 34, 212 22, 217 17 C 219 29, 220 43, 222 52 C 228 43, 234 38, 237 44 C 239 51, 230 54, 228 47 C 232 45, 237 50, 241 44 C 247 34, 252 21, 250 17 C 246 18, 244 41, 248 51 C 252 47, 255 40, 259 40 C 261 46, 263 53, 267 48 C 270 43, 273 39, 275 43 C 276 49, 279 52, 284 44 C 287 40, 290 40, 291 48 C 293 52, 298 44, 301 39 C 301 52, 298 69, 290 71 C 284 72, 286 60, 298 51 C 305 45, 312 39, 317 41 C 320 46, 312 53, 310 47 C 314 45, 320 51, 329 45"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dot on "i" */}
      <path
        d="M 274 30 C 275 29, 277 29, 277 31"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Signature underline flourish */}
      <path
        d="M 118 65 C 192 56, 268 56, 336 61"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
