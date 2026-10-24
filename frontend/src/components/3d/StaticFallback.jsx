import React from 'react';

/** Hand-drawn static pickle jar illustration for the storefront hero. */
export default function StaticFallback({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 520 470" role="img" aria-label="Illustration of a traditional pickle jar">
      <defs>
        <linearGradient id="jaadi-glass" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fffdf8" stopOpacity=".8" />
          <stop offset=".5" stopColor="#d8d0bd" stopOpacity=".34" />
          <stop offset="1" stopColor="#fffdf8" stopOpacity=".8" />
        </linearGradient>
        <linearGradient id="jaadi-pickle" x1="0" x2=".9" y1="0" y2="1">
          <stop offset="0" stopColor="#b55023" />
          <stop offset="1" stopColor="#79321d" />
        </linearGradient>
        <clipPath id="jaadi-body">
          <path d="M183 124 Q183 103 203 98 L218 93 L218 68 L302 68 L302 93 L317 98 Q337 103 337 124 L337 354 Q337 383 307 383 L213 383 Q183 383 183 354 Z" />
        </clipPath>
      </defs>
      <ellipse cx="260" cy="404" rx="119" ry="15" fill="#544432" opacity=".12" />
      <path d="M122 346 C88 319 83 286 104 263 C123 282 137 306 137 328 C150 303 168 291 187 289 C183 317 166 341 141 354Z" fill="#48543b" />
      <path d="M396 329 C421 300 421 273 403 248 C383 267 371 290 373 312 C357 291 338 283 320 284 C326 310 345 331 370 341Z" fill="#5a6648" />
      <path d="M183 124 Q183 103 203 98 L218 93 L218 68 L302 68 L302 93 L317 98 Q337 103 337 124 L337 354 Q337 383 307 383 L213 383 Q183 383 183 354 Z" fill="url(#jaadi-glass)" stroke="#a5977b" strokeWidth="3" />
      <g clipPath="url(#jaadi-body)">
        <path d="M184 218 Q260 208 336 219 L336 363 Q336 382 309 382 L211 382 Q184 382 184 361Z" fill="url(#jaadi-pickle)" />
        <path d="M184 218 Q260 208 336 219" fill="none" stroke="#dc9b46" strokeWidth="5" opacity=".8" />
        <path d="M204 259 l23 -15 18 18 -12 22 -27 -4Z M270 295 l25 -17 21 15 -7 27 -29 1Z M230 338 l19 -18 23 13 -8 25 -28 2Z M293 245 l18 3 9 20 -17 14 -17 -17Z" fill="#d28239" stroke="#9c4b25" strokeWidth="3" />
        <g fill="#dfbe71">
          <circle cx="206" cy="293" r="3" /><circle cx="258" cy="244" r="3" /><circle cx="314" cy="308" r="3" />
          <circle cx="245" cy="293" r="2.5" /><circle cx="280" cy="350" r="3" /><circle cx="221" cy="358" r="2.5" />
          <circle cx="310" cy="233" r="2.5" /><circle cx="197" cy="333" r="3" />
        </g>
      </g>
      <path d="M195 120 Q195 109 208 106 L216 104 L216 82 L220 82 L220 101 Q202 108 202 123 L202 351 Q202 367 215 371" fill="none" stroke="#fffdf8" strokeWidth="7" strokeLinecap="round" opacity=".75" />
      <rect x="215" y="278" width="90" height="43" fill="#efe4cc" stroke="#8e3d2e" strokeWidth="2" />
      <text x="260" y="296" textAnchor="middle" fill="#733325" fontFamily="Georgia, serif" fontSize="9" letterSpacing="1.1">BRAMARAMBIKA</text>
      <text x="260" y="310" textAnchor="middle" fill="#625646" fontFamily="Arial, sans-serif" fontSize="7" letterSpacing="1.3">HOME FOODS</text>
      <rect x="214" y="56" width="92" height="19" rx="3" fill="#b08b4a" />
      <path d="M220 58 H300 M220 72 H300" stroke="#ddc587" strokeWidth="2" opacity=".75" />
      <path d="M190 135 V340 M330 137 V346" stroke="#fffdf8" strokeWidth="3" opacity=".42" />
    </svg>
  );
}
