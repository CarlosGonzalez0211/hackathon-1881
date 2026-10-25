import { useId } from "react";

/** A quiet storybook vignette beside the learning content. Decorative; state stays in text. */
export function HouseVignette() {
  const id = useId().replaceAll(":", "");
  const tree = (x: number, y: number, scale = 1) => (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-3 1 1-49 7-1" fill="#9c8b66" />
      <path d="M0-19-20-44M3-28 21-57" fill="none" />
      <path
        d="M-25-48c-20-18-7-45 12-46 5-17 36-18 44 0 25 4 29 36 10 48-7 17-31 21-43 9-11 10-27 3-23-11Z"
        fill="#94b57c"
      />
      <path
        d="M-18-80c7-11 23-15 34-8m-29 35c9 6 23 4 30-3"
        fill="none"
        stroke="#c4d4a0"
        strokeWidth="4"
      />
    </g>
  );
  const tower = (x: number, y: number, scale: number, roof: string) => (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cy="8" rx="48" ry="17" fill="#a6ae7d" stroke="none" />
      <path d="M-39-77q39-20 78 0v73Q3 17-39-4Z" fill="#e7d8b5" />
      <path d="M-30-69v60m48-58v72" opacity=".2" />
      <path d="M-10 2v-28q10-17 20 0V7" fill="#827b68" />
      <path d="M-29-50q6-8 12 0v15h-12Zm47-4q6-8 12 0v15H18Z" fill="#a0afa0" />
      <path d="M-48-77q35-16 48-85 18 66 48 85Q3-50-48-77Z" fill={roof} />
      <path d="M-42-76q39 21 84 0" fill="none" strokeWidth="4" opacity=".3" />
      <path d="m0-175 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill="#e2c26f" />
    </g>
  );
  return (
    <svg
      viewBox="0 0 640 540"
      className="house-vignette"
      fill="none"
      stroke="#6b6855"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-island`} x2="0" y2="1">
          <stop stopColor="#abc383" />
          <stop offset="1" stopColor="#63916a" />
        </linearGradient>
      </defs>
      <g stroke="#98937b" strokeDasharray="3 8">
        <path d="M77 287c-64-97 32-168 198-146s319 39 290 146-27 180-206 189S79 430 77 287Z" />
      </g>
      <path d="M108 302c-2 99 68 192 205 201 143-10 210-103 218-201Z" fill={`url(#${id}-island)`} />
      <ellipse cx="319" cy="304" rx="213" ry="118" fill="#adc68a" />
      <path
        d="M318 206c-45 37 3 54-6 83s-55 23-56 46 39 31 54 54"
        stroke="#d9cd9b"
        strokeWidth="29"
      />
      <path d="M333 351c18-16 60-8 73 13s-4 29-41 25-56-22-32-38Z" fill="#a1c4c1" />
      <path d="M344 359q25-5 43 8" stroke="#e9e5c9" />
      {tower(224, 292, 0.65, "#75818a")}
      {tree(467, 263, 0.77)}
      {tower(451, 311, 0.62, "#af7958")}
      {tower(337, 285, 0.96, "#98645c")}
      {tree(170, 330, 0.85)}
      {tree(488, 347, 0.88)}
      <g transform="translate(439 370)">
        <path d="m0-87-26 44 12 1-21 32 33 6 35-7-20-32 12-1Z" fill="#83a379" />
        <path d="M0-4V9" strokeWidth="5" />
      </g>
      <g transform="translate(310 329)">
        <ellipse cy="7" rx="13" ry="4" fill="#8f9f72" stroke="none" />
        <path d="m-6-5-1 13m12-13 2 13" strokeWidth="4" />
        <path d="M-12-31-16-6 0 0 14-6 10-31" fill="#d8a05a" />
        <ellipse cy="-41" rx="12" ry="14" fill="#aa724b" />
        <path d="M-8-43q8-9 16 0v10q-8 10-16 0Z" fill="#e5cba4" />
        <path d="M-12-24-20-8m32-16 8 13" strokeWidth="4" />
      </g>
      <g fill="#dce0b5" stroke="none">
        {Array.from({ length: 29 }, (_, i) => (
          <path
            key={i}
            d={`m${145 + ((i * 47) % 350)} ${290 + ((i * 29) % 105)} -2-7 4 4 3-6 1 9Z`}
          />
        ))}
      </g>
      <g fill="#e9cf7f">
        {[
          [140, 192],
          [268, 150],
          [396, 204],
          [456, 146],
          [516, 246],
          [171, 400],
          [390, 424],
          [118, 365],
        ].map(([x = 0, y = 0], i) => (
          <path key={i} d={`m${x} ${y - 6} 2 4 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1Z`} />
        ))}
      </g>
      <g fill="#f7f3e7">
        <path d="M81 222c-12-3-10-18 1-20 0-16 29-18 35-4 16-4 27 13 15 17Z" />
        <path d="M433 116c-10-5-7-18 4-20 4-17 29-18 36-4 18-4 31 17 16 21Z" />
        <path d="M88 384c-16-3-10-23 4-24 3-19 31-18 39-1 17-1 24 15 11 21Z" />
        <path d="M480 390c-9-5-8-18 3-20 4-17 30-17 37-2 17-4 29 14 18 22Z" />
      </g>
      <g stroke="#8f8c78">
        <path d="m169 124 38-18-10 35-28-17m31 21 24 12m270-5 29 4-15 35-29-7Z" />
        <g fill="#f6f2e6">
          {[
            [169, 124],
            [207, 106],
            [197, 141],
            [224, 157],
            [494, 152],
            [523, 156],
            [508, 191],
            [479, 184],
          ].map(([x = 0, y = 0], i) => (
            <circle key={i} cx={x} cy={y} r="2.2" />
          ))}
        </g>
      </g>
    </svg>
  );
}
