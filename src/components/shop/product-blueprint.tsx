/**
 * SVG Blueprint Product Images
 * Technical wireframe drawings for each garment type.
 * Green lines on ink-black with grid overlay, dimension lines, and construction notes.
 */

interface ProductBlueprintProps {
  productId: string;
  lineColor: string;
  className?: string;
}

type GarmentType = "hoodie" | "longsleeve" | "balaclava" | "field-jacket" | "cargo-pant" | "tee" | "shades" | "belt" | "tote";

const PRODUCT_GARMENT_MAP: Record<string, GarmentType> = {
  rw001: "hoodie",
  rw002: "longsleeve",
  rw003: "balaclava",
  fw001: "field-jacket",
  fw002: "cargo-pant",
  fw003: "tee",
  ed001: "tee",
  ed002: "hoodie",
  ed003: "tee",
  ac001: "shades",
  ac002: "belt",
  ac003: "tote",
};

function GridOverlay({ color }: { color: string }) {
  return (
    <g opacity="0.06">
      {/* Vertical grid lines */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`v${i}`} x1={50 + i * 50} y1="0" x2={50 + i * 50} y2="500" stroke={color} strokeWidth="0.5" />
      ))}
      {/* Horizontal grid lines */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={50 + i * 50} x2="500" y2={50 + i * 50} stroke={color} strokeWidth="0.5" />
      ))}
    </g>
  );
}

function DimensionLine({ x1, y1, x2, y2, label, color, side = "right" }: {
  x1: number; y1: number; x2: number; y2: number; label: string; color: string; side?: "right" | "left" | "bottom";
}) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const isVertical = x1 === x2;
  return (
    <g opacity="0.35">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.5" strokeDasharray="3 2" />
      {/* End ticks */}
      {isVertical ? (
        <>
          <line x1={x1 - 4} y1={y1} x2={x1 + 4} y2={y1} stroke={color} strokeWidth="0.5" />
          <line x1={x2 - 4} y1={y2} x2={x2 + 4} y2={y2} stroke={color} strokeWidth="0.5" />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} stroke={color} strokeWidth="0.5" />
          <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} stroke={color} strokeWidth="0.5" />
        </>
      )}
      <text
        x={isVertical ? (side === "right" ? midX + 10 : midX - 10) : midX}
        y={isVertical ? midY : (side === "bottom" ? midY + 14 : midY - 6)}
        fill={color}
        fontSize="8"
        fontFamily="var(--font-mono)"
        textAnchor={isVertical && side === "left" ? "end" : "middle"}
        dominantBaseline="middle"
        letterSpacing="0.12em"
      >
        {label}
      </text>
    </g>
  );
}

function ConstructionNote({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  return (
    <text
      x={x} y={y}
      fill={color}
      fontSize="7"
      fontFamily="var(--font-mono)"
      letterSpacing="0.14em"
      opacity="0.4"
    >
      {text}
    </text>
  );
}

function CrosshairMark({ cx, cy, color, size = 6 }: { cx: number; cy: number; color: string; size?: number }) {
  return (
    <g opacity="0.25">
      <line x1={cx - size} y1={cy} x2={cx + size} y2={cy} stroke={color} strokeWidth="0.5" />
      <line x1={cx} y1={cy - size} x2={cx} y2={cy + size} stroke={color} strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={size * 0.6} fill="none" stroke={color} strokeWidth="0.5" />
    </g>
  );
}

function ScanlineOverlay() {
  return (
    <g opacity="0.03">
      {Array.from({ length: 125 }, (_, i) => (
        <line key={i} x1="0" y1={i * 4} x2="500" y2={i * 4} stroke="#fff" strokeWidth="1" />
      ))}
    </g>
  );
}

/* ═══════════════════════════════════════
   GARMENT DRAWINGS
   ═══════════════════════════════════════ */

function HoodieDrawing({ color }: { color: string }) {
  return (
    <g>
      {/* Hood */}
      <path
        d="M195 140 Q195 105 215 90 Q230 80 250 78 Q270 80 285 90 Q305 105 305 140"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Hood inner line */}
      <path
        d="M210 135 Q215 110 230 100 Q240 95 250 93 Q260 95 270 100 Q285 110 290 135"
        fill="none" stroke={color} strokeWidth="0.5" opacity="0.3"
      />
      {/* Shoulders + body */}
      <path
        d="M195 140 L155 155 L145 165 L145 290 Q145 298 152 300 L200 300 L200 315 Q200 323 208 325 L292 325 Q300 323 300 315 L300 300 L348 300 Q355 298 355 290 L355 165 L345 155 L305 140"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Left sleeve */}
      <path
        d="M155 155 L100 175 L95 180 L95 235 Q95 240 100 242 L140 252 L145 250"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Right sleeve */}
      <path
        d="M345 155 L400 175 L405 180 L405 235 Q405 240 400 242 L360 252 L355 250"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Center kangaroo pocket */}
      <path
        d="M200 255 Q200 245 215 242 L285 242 Q300 245 300 255 L300 300 L200 300 Z"
        fill="none" stroke={color} strokeWidth="0.8" opacity="0.5"
      />
      {/* Pocket opening */}
      <line x1="215" y1="265" x2="285" y2="265" stroke={color} strokeWidth="0.6" opacity="0.4" />
      {/* Center seam */}
      <line x1="250" y1="140" x2="250" y2="325" stroke={color} strokeWidth="0.3" opacity="0.15" strokeDasharray="4 3" />
      {/* Ribbing lines at hem */}
      <line x1="208" y1="318" x2="292" y2="318" stroke={color} strokeWidth="0.4" opacity="0.3" />
      <line x1="208" y1="321" x2="292" y2="321" stroke={color} strokeWidth="0.4" opacity="0.2" />
      {/* Cuff ribbing */}
      <line x1="95" y1="236" x2="140" y2="247" stroke={color} strokeWidth="0.4" opacity="0.3" />
      <line x1="405" y1="236" x2="360" y2="247" stroke={color} strokeWidth="0.4" opacity="0.3" />
      {/* KPT glyph placeholder on chest */}
      <rect x="230" y="170" width="40" height="20" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" strokeDasharray="2 2" />
      <ConstructionNote x={233} y={183} text="GLYPH" color={color} />
      {/* Dimension lines */}
      <DimensionLine x1={80} y1={78} x2={80} y2={325} label="72cm" color={color} side="left" />
      <DimensionLine x1={95} y1={350} x2={405} y2={350} label="62cm SPAN" color={color} side="bottom" />
      {/* Construction crosshairs */}
      <CrosshairMark cx={155} cy={155} color={color} />
      <CrosshairMark cx={345} cy={155} color={color} />
    </g>
  );
}

function LongsleeveDrawing({ color }: { color: string }) {
  return (
    <g>
      {/* Collar */}
      <path
        d="M220 120 Q230 112 250 110 Q270 112 280 120"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Body */}
      <path
        d="M220 120 L190 132 L180 138 L175 300 Q175 310 185 312 L315 312 Q325 310 325 300 L320 138 L310 132 L280 120"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Left sleeve — extended */}
      <path
        d="M190 132 L105 158 L92 165 L85 260 Q85 266 90 268 L120 275 L125 273"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Right sleeve — extended */}
      <path
        d="M310 132 L395 158 L408 165 L415 260 Q415 266 410 268 L380 275 L375 273"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Crossover back print outline */}
      <path
        d="M200 155 L250 195 L300 155 M200 225 L250 185 L300 225"
        fill="none" stroke={color} strokeWidth="0.6" opacity="0.25"
      />
      {/* UV nape label */}
      <rect x="237" y="113" width="26" height="8" fill="none" stroke={color} strokeWidth="0.4" opacity="0.3" />
      <ConstructionNote x={240} y={119} text="UV" color={color} />
      {/* Wrist frequency print */}
      <rect x="87" y="250" width="30" height="12" fill="none" stroke={color} strokeWidth="0.4" opacity="0.3" />
      <ConstructionNote x={90} y={259} text="FREQ" color={color} />
      {/* Hem ribbing */}
      <line x1="185" y1="306" x2="315" y2="306" stroke={color} strokeWidth="0.4" opacity="0.3" />
      <line x1="185" y1="309" x2="315" y2="309" stroke={color} strokeWidth="0.4" opacity="0.2" />
      {/* Dimension lines */}
      <DimensionLine x1={70} y1={110} x2={70} y2={312} label="68cm" color={color} side="left" />
      <DimensionLine x1={85} y1={340} x2={415} y2={340} label="78cm SPAN" color={color} side="bottom" />
      {/* Construction crosshairs */}
      <CrosshairMark cx={190} cy={132} color={color} />
      <CrosshairMark cx={310} cy={132} color={color} />
    </g>
  );
}

function BalaclavaDrawing({ color }: { color: string }) {
  return (
    <g>
      {/* Head shape outer */}
      <path
        d="M190 230 L190 155 Q190 100 220 80 Q235 70 250 68 Q265 70 280 80 Q310 100 310 155 L310 230 Q310 250 290 260 L275 265 L275 310 Q275 320 265 322 L235 322 Q225 320 225 310 L225 265 L210 260 Q190 250 190 230 Z"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Face opening */}
      <path
        d="M215 160 Q215 145 230 138 Q240 134 250 133 Q260 134 270 138 Q285 145 285 160 L285 200 Q285 215 270 222 Q260 226 250 227 Q240 226 230 222 Q215 215 215 200 Z"
        fill="none" stroke={color} strokeWidth="1" opacity="0.6"
      />
      {/* Single seam line */}
      <line x1="250" y1="68" x2="250" y2="322" stroke={color} strokeWidth="0.4" opacity="0.2" strokeDasharray="3 3" />
      {/* 3M reflective panel */}
      <rect x="222" y="80" width="56" height="35" rx="3" fill="none" stroke={color} strokeWidth="0.6" opacity="0.35" strokeDasharray="2 2" />
      <ConstructionNote x={230} y={102} text="3M PANEL" color={color} />
      {/* Neck extension ribbing */}
      <line x1="225" y1="295" x2="275" y2="295" stroke={color} strokeWidth="0.4" opacity="0.3" />
      <line x1="225" y1="300" x2="275" y2="300" stroke={color} strokeWidth="0.4" opacity="0.2" />
      <line x1="225" y1="305" x2="275" y2="305" stroke={color} strokeWidth="0.4" opacity="0.15" />
      {/* Dimension lines */}
      <DimensionLine x1={170} y1={68} x2={170} y2={322} label="42cm" color={color} side="left" />
      <DimensionLine x1={190} y1={345} x2={310} y2={345} label="24cm" color={color} side="bottom" />
      {/* Construction crosshairs */}
      <CrosshairMark cx={250} cy={68} color={color} />
      <CrosshairMark cx={250} cy={133} color={color} />
    </g>
  );
}

function FieldJacketDrawing({ color }: { color: string }) {
  return (
    <g>
      {/* Collar / stand */}
      <path
        d="M210 108 Q210 95 225 90 Q237 87 250 86 Q263 87 275 90 Q290 95 290 108"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Body — structured / boxy */}
      <path
        d="M210 108 L168 125 L155 135 L148 330 Q148 340 158 342 L342 342 Q352 340 352 330 L345 135 L332 125 L290 108"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Left sleeve */}
      <path
        d="M168 125 L98 148 L85 158 L80 255 Q80 262 87 264 L125 275 L130 273"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Right sleeve */}
      <path
        d="M332 125 L402 148 L415 158 L420 255 Q420 262 413 264 L375 275 L370 273"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Center zip */}
      <line x1="250" y1="108" x2="250" y2="342" stroke={color} strokeWidth="0.8" opacity="0.3" />
      {/* Zip teeth marks */}
      {Array.from({ length: 15 }, (_, i) => (
        <g key={i} opacity="0.15">
          <line x1="247" y1={120 + i * 15} x2="253" y2={120 + i * 15} stroke={color} strokeWidth="0.5" />
        </g>
      ))}
      {/* Cobra buckle chest strap */}
      <line x1="180" y1="185" x2="320" y2="185" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <rect x="235" y="180" width="30" height="10" rx="2" fill="none" stroke={color} strokeWidth="0.6" opacity="0.4" />
      <ConstructionNote x={240} y={188} text="COBRA" color={color} />
      {/* Chest pockets */}
      <rect x="170" y="150" width="55" height="40" fill="none" stroke={color} strokeWidth="0.6" opacity="0.3" />
      <rect x="275" y="150" width="55" height="40" fill="none" stroke={color} strokeWidth="0.6" opacity="0.3" />
      {/* Lower cargo pockets */}
      <rect x="165" y="240" width="60" height="55" fill="none" stroke={color} strokeWidth="0.6" opacity="0.3" />
      <rect x="275" y="240" width="60" height="55" fill="none" stroke={color} strokeWidth="0.6" opacity="0.3" />
      {/* Faraday inner pocket indicator */}
      <rect x="190" y="210" width="35" height="20" fill="none" stroke={color} strokeWidth="0.4" opacity="0.2" strokeDasharray="2 2" />
      <ConstructionNote x={193} y={223} text="FRDY" color={color} />
      {/* Taped seam indicators */}
      <line x1="155" y1="135" x2="148" y2="330" stroke={color} strokeWidth="0.3" opacity="0.15" strokeDasharray="1 3" />
      <line x1="345" y1="135" x2="352" y2="330" stroke={color} strokeWidth="0.3" opacity="0.15" strokeDasharray="1 3" />
      {/* Dimension lines */}
      <DimensionLine x1={65} y1={86} x2={65} y2={342} label="82cm" color={color} side="left" />
      <DimensionLine x1={80} y1={365} x2={420} y2={365} label="76cm SPAN" color={color} side="bottom" />
      {/* Construction crosshairs */}
      <CrosshairMark cx={168} cy={125} color={color} />
      <CrosshairMark cx={332} cy={125} color={color} />
    </g>
  );
}

function CargoPantDrawing({ color }: { color: string }) {
  return (
    <g>
      {/* Waistband */}
      <path
        d="M170 95 L170 80 Q170 72 178 70 L322 70 Q330 72 330 80 L330 95"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Body + legs */}
      <path
        d="M170 95 L162 190 L162 200 L155 205 L155 395 Q155 402 162 404 L220 404 Q227 402 227 395 L227 200 L250 190 L273 200 L273 395 Q273 402 280 404 L338 404 Q345 402 345 395 L345 205 L338 200 L338 190 L330 95"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Center seam / fly */}
      <line x1="250" y1="70" x2="250" y2="190" stroke={color} strokeWidth="0.6" opacity="0.3" />
      {/* Belt loops */}
      {[185, 215, 250, 285, 315].map((x) => (
        <rect key={x} x={x - 4} y={70} width={8} height={12} fill="none" stroke={color} strokeWidth="0.4" opacity="0.3" />
      ))}
      {/* Cargo pockets — left leg */}
      <rect x="158" y="235" width="50" height="60" fill="none" stroke={color} strokeWidth="0.6" opacity="0.35" />
      <line x1="158" y1="250" x2="208" y2="250" stroke={color} strokeWidth="0.4" opacity="0.3" />
      {/* Cargo pockets — right leg */}
      <rect x="292" y="235" width="50" height="60" fill="none" stroke={color} strokeWidth="0.6" opacity="0.35" />
      <line x1="292" y1="250" x2="342" y2="250" stroke={color} strokeWidth="0.4" opacity="0.3" />
      {/* Articulated knee */}
      <path
        d="M160 310 Q190 305 220 310"
        fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" strokeDasharray="3 2"
      />
      <path
        d="M280 310 Q310 305 340 310"
        fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" strokeDasharray="3 2"
      />
      <ConstructionNote x={165} y={325} text="ART.KNEE" color={color} />
      {/* Ripstop knee panel */}
      <rect x="158" y="300" width="65" height="30" fill="none" stroke={color} strokeWidth="0.4" opacity="0.2" strokeDasharray="2 2" />
      {/* Gusset indicator */}
      <path d="M235 180 L250 200 L265 180" fill="none" stroke={color} strokeWidth="0.4" opacity="0.25" />
      <ConstructionNote x={237} y={175} text="GUSSET" color={color} />
      {/* Dimension lines */}
      <DimensionLine x1={138} y1={70} x2={138} y2={404} label="106cm" color={color} side="left" />
      <DimensionLine x1={155} y1={425} x2={345} y2={425} label="48cm WAIST" color={color} side="bottom" />
      {/* Construction crosshairs */}
      <CrosshairMark cx={250} cy={190} color={color} />
    </g>
  );
}

function TeeDrawing({ color }: { color: string }) {
  return (
    <g>
      {/* Collar */}
      <path
        d="M215 128 Q220 118 235 114 Q242 112 250 111 Q258 112 265 114 Q280 118 285 128"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Body */}
      <path
        d="M215 128 L185 138 L170 148 L168 295 Q168 305 178 307 L322 307 Q332 305 332 295 L330 148 L315 138 L285 128"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Left sleeve */}
      <path
        d="M185 138 L125 160 L118 165 L115 210 Q115 216 120 218 L155 228 L158 225"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Right sleeve */}
      <path
        d="M315 138 L375 160 L382 165 L385 210 Q385 216 380 218 L345 228 L342 225"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Center seam (subtle) */}
      <line x1="250" y1="128" x2="250" y2="307" stroke={color} strokeWidth="0.3" opacity="0.12" strokeDasharray="4 3" />
      {/* Chest hit placeholder */}
      <rect x="225" y="155" width="50" height="25" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" strokeDasharray="2 2" />
      <ConstructionNote x={232} y={171} text="CHEST HIT" color={color} />
      {/* Back cert block (shown as ghost outline) */}
      <rect x="200" y="200" width="100" height="60" fill="none" stroke={color} strokeWidth="0.4" opacity="0.12" strokeDasharray="3 3" />
      <ConstructionNote x={218} y={235} text="BACK PRINT" color={color} />
      {/* Hem */}
      <line x1="178" y1="302" x2="322" y2="302" stroke={color} strokeWidth="0.4" opacity="0.3" />
      {/* Dimension lines */}
      <DimensionLine x1={100} y1={111} x2={100} y2={307} label="58cm" color={color} side="left" />
      <DimensionLine x1={115} y1={335} x2={385} y2={335} label="68cm SPAN" color={color} side="bottom" />
      {/* Construction crosshairs */}
      <CrosshairMark cx={185} cy={138} color={color} />
      <CrosshairMark cx={315} cy={138} color={color} />
    </g>
  );
}

function ShadesDrawing({ color }: { color: string }) {
  return (
    <g>
      {/* Bridge */}
      <path
        d="M225 200 Q237 192 250 190 Q263 192 275 200"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Left lens — rectangular/angular */}
      <path
        d="M225 200 L145 195 Q130 195 128 205 L126 240 Q126 258 142 260 L210 262 Q225 260 228 248 L230 215 Q230 205 225 200 Z"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Right lens */}
      <path
        d="M275 200 L355 195 Q370 195 372 205 L374 240 Q374 258 358 260 L290 262 Q275 260 272 248 L270 215 Q270 205 275 200 Z"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Left temple arm */}
      <path
        d="M128 202 L85 198 Q72 198 68 205 L55 240 Q52 252 58 260 L75 280"
        fill="none" stroke={color} strokeWidth="1" opacity="0.6"
      />
      {/* Right temple arm */}
      <path
        d="M372 202 L415 198 Q428 198 432 205 L445 240 Q448 252 442 260 L425 280"
        fill="none" stroke={color} strokeWidth="1" opacity="0.6"
      />
      {/* Lens coating indicator */}
      <path
        d="M150 215 Q175 210 200 218"
        fill="none" stroke={color} strokeWidth="0.4" opacity="0.2"
      />
      <path
        d="M300 218 Q325 210 350 215"
        fill="none" stroke={color} strokeWidth="0.4" opacity="0.2"
      />
      <ConstructionNote x={160} y={240} text="UV400" color={color} />
      <ConstructionNote x={305} y={240} text="POLAR" color={color} />
      {/* TR90 frame callout */}
      <ConstructionNote x={195} y={280} text="TR90 MATTE FRAME" color={color} />
      {/* Faraday case outline */}
      <rect x="170" y="310" width="160" height="50" rx="5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" strokeDasharray="3 3" />
      <ConstructionNote x={200} y={340} text="FARADAY CASE" color={color} />
      {/* Dimension lines */}
      <DimensionLine x1={126} y1={175} x2={374} y2={175} label="148mm" color={color} side="bottom" />
      <DimensionLine x1={430} y1={195} x2={430} y2={280} label="42mm" color={color} side="right" />
      {/* Construction crosshairs */}
      <CrosshairMark cx={250} cy={190} color={color} />
      <CrosshairMark cx={128} cy={230} color={color} />
      <CrosshairMark cx={372} cy={230} color={color} />
    </g>
  );
}

function BeltDrawing({ color }: { color: string }) {
  return (
    <g>
      {/* Main belt strap — shown flat/coiled */}
      <path
        d="M80 220 L360 220 Q380 220 385 230 L390 240 Q395 250 385 255 L115 255 Q95 255 90 245 L85 235 Q80 225 80 220 Z"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Cobra buckle — detailed */}
      <rect x="360" y="205" width="60" height="50" rx="4" fill="none" stroke={color} strokeWidth="1.2" />
      {/* Buckle inner mechanism */}
      <rect x="370" y="215" width="40" height="30" rx="2" fill="none" stroke={color} strokeWidth="0.6" opacity="0.4" />
      <line x1="390" y1="215" x2="390" y2="245" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <line x1="370" y1="230" x2="410" y2="230" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <ConstructionNote x={373} y={228} text="COBRA" color={color} />
      {/* Webbing texture lines */}
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={100 + i * 20} y1={225} x2={100 + i * 20} y2={250} stroke={color} strokeWidth="0.3" opacity="0.1" />
      ))}
      {/* Modular attachment points */}
      {[140, 200, 260].map((x) => (
        <g key={x}>
          <circle cx={x} cy={237} r={6} fill="none" stroke={color} strokeWidth="0.6" opacity="0.35" />
          <circle cx={x} cy={237} r={2} fill="none" stroke={color} strokeWidth="0.4" opacity="0.25" />
        </g>
      ))}
      <ConstructionNote x={135} y={270} text="MOLLE ATTACH x3" color={color} />
      {/* Tail / keeper */}
      <path
        d="M80 220 L55 215 Q45 215 42 220 L42 235 Q42 245 50 248 L80 255"
        fill="none" stroke={color} strokeWidth="0.8" opacity="0.5"
      />
      {/* SWL rating */}
      <ConstructionNote x={165} y={295} text="SWL: 40KG RATED" color={color} />
      <ConstructionNote x={165} y={308} text="1000D NYLON WEBBING" color={color} />
      {/* Dimension lines */}
      <DimensionLine x1={42} y1={185} x2={420} y2={185} label="120cm MAX" color={color} side="bottom" />
      <DimensionLine x1={430} y1={205} x2={430} y2={255} label="38mm" color={color} side="right" />
      {/* Construction crosshairs */}
      <CrosshairMark cx={390} cy={230} color={color} />
    </g>
  );
}

function ToteDrawing({ color }: { color: string }) {
  return (
    <g>
      {/* Handles */}
      <path
        d="M185 120 L185 85 Q185 68 200 65 L215 65"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      <path
        d="M315 120 L315 85 Q315 68 300 65 L285 65"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      <line x1="215" y1="65" x2="285" y2="65" stroke={color} strokeWidth="1.2" />
      {/* Second handle */}
      <path
        d="M195 120 L195 95 Q195 80 208 78 L220 78"
        fill="none" stroke={color} strokeWidth="0.8" opacity="0.5"
      />
      <path
        d="M305 120 L305 95 Q305 80 292 78 L280 78"
        fill="none" stroke={color} strokeWidth="0.8" opacity="0.5"
      />
      <line x1="220" y1="78" x2="280" y2="78" stroke={color} strokeWidth="0.8" opacity="0.5" />
      {/* Bag body */}
      <path
        d="M145 120 L145 340 Q145 355 160 358 L340 358 Q355 355 355 340 L355 120 Z"
        fill="none" stroke={color} strokeWidth="1.2"
      />
      {/* Adversarial patch pattern (abstract) */}
      <g opacity="0.12">
        <rect x="165" y="150" width="170" height="130" fill="none" stroke={color} strokeWidth="0.5" />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`ap${i}`} x1={165 + i * 34} y1="150" x2={165 + (i + 1) * 34} y2="280" stroke={color} strokeWidth="0.4" />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`apb${i}`} x1={165 + (i + 1) * 34} y1="150" x2={165 + i * 34} y2="280" stroke={color} strokeWidth="0.4" />
        ))}
      </g>
      <ConstructionNote x={185} y={225} text="ADVERSARIAL PATCH" color={color} />
      {/* Faraday lining indicator */}
      <rect x="155" y="130" width="190" height="220" fill="none" stroke={color} strokeWidth="0.3" opacity="0.15" strokeDasharray="4 2" />
      <ConstructionNote x={170} y={145} text="FARADAY LINING" color={color} />
      {/* Bottom reinforcement */}
      <line x1="145" y1="330" x2="355" y2="330" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <ConstructionNote x={180} y={348} text="REINFORCED BASE" color={color} />
      {/* LP fit indicators */}
      <rect x="180" y="290" width="60" height="60" fill="none" stroke={color} strokeWidth="0.4" opacity="0.2" strokeDasharray="2 2" />
      <rect x="260" y="290" width="60" height="60" fill="none" stroke={color} strokeWidth="0.4" opacity="0.2" strokeDasharray="2 2" />
      <ConstructionNote x={190} y={325} text="LP" color={color} />
      <ConstructionNote x={270} y={325} text="LP" color={color} />
      {/* Dimension lines */}
      <DimensionLine x1={130} y1={65} x2={130} y2={358} label="48cm" color={color} side="left" />
      <DimensionLine x1={145} y1={380} x2={355} y2={380} label="42cm" color={color} side="bottom" />
      {/* Construction crosshairs */}
      <CrosshairMark cx={250} cy={120} color={color} />
    </g>
  );
}

const GARMENT_RENDERERS: Record<GarmentType, (props: { color: string }) => React.JSX.Element> = {
  hoodie: HoodieDrawing,
  longsleeve: LongsleeveDrawing,
  balaclava: BalaclavaDrawing,
  "field-jacket": FieldJacketDrawing,
  "cargo-pant": CargoPantDrawing,
  tee: TeeDrawing,
  shades: ShadesDrawing,
  belt: BeltDrawing,
  tote: ToteDrawing,
};

export function ProductBlueprint({ productId, lineColor, className }: ProductBlueprintProps) {
  const garmentType = PRODUCT_GARMENT_MAP[productId] ?? "tee";
  const GarmentRenderer = GARMENT_RENDERERS[garmentType];

  return (
    <svg
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Background */}
      <rect width="500" height="500" fill="#050505" />

      {/* Grid */}
      <GridOverlay color={lineColor} />

      {/* Scanlines */}
      <ScanlineOverlay />

      {/* Garment drawing */}
      <GarmentRenderer color={lineColor} />

      {/* Corner registration marks */}
      <g opacity="0.15">
        <path d="M15 30 L15 15 L30 15" fill="none" stroke={lineColor} strokeWidth="0.5" />
        <path d="M470 15 L485 15 L485 30" fill="none" stroke={lineColor} strokeWidth="0.5" />
        <path d="M485 470 L485 485 L470 485" fill="none" stroke={lineColor} strokeWidth="0.5" />
        <path d="M30 485 L15 485 L15 470" fill="none" stroke={lineColor} strokeWidth="0.5" />
      </g>
    </svg>
  );
}
