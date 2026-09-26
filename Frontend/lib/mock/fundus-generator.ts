import { DRGrade } from "@/types/ai-result";

// Helper to generate an authentic SVG data URL representing a high-resolution fundus photograph
export function generateFundusSvgDataUrl(grade: DRGrade, eye: "OD" | "OS" = "OD"): string {
  const isOD = eye === "OD";
  const discX = isOD ? 240 : 560;
  const discY = 400;
  const maculaX = isOD ? 520 : 280;
  const maculaY = 400;

  // Background hue/gradients based on severity
  const bgGrad = `
    <radialGradient id="fundusGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C2410C" stop-opacity="0.9" />
      <stop offset="55%" stop-color="#9A3412" stop-opacity="0.95" />
      <stop offset="85%" stop-color="#7C2D12" stop-opacity="1" />
      <stop offset="100%" stop-color="#451A03" stop-opacity="1" />
    </radialGradient>
    <radialGradient id="discGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.9" />
      <stop offset="40%" stop-color="#FDE047" stop-opacity="0.8" />
      <stop offset="85%" stop-color="#EAB308" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#CA8A04" stop-opacity="0.1" />
    </radialGradient>
    <radialGradient id="maculaGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#451A03" stop-opacity="0.8" />
      <stop offset="60%" stop-color="#7C2D12" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#9A3412" stop-opacity="0" />
    </radialGradient>
  `;

  // Retinal blood vessels
  const arcadeArchOD = `
    <!-- Superior Temporal Arcade -->
    <path d="M 240 395 C 270 310, 360 210, 520 230 C 600 240, 680 290, 740 370" fill="none" stroke="#7F1D1D" stroke-width="9" stroke-linecap="round" filter="blur(0.5px)" opacity="0.9"/>
    <path d="M 240 395 C 270 310, 360 210, 520 230 C 600 240, 680 290, 740 370" fill="none" stroke="#991B1B" stroke-width="5" stroke-linecap="round"/>
    <path d="M 400 220 C 440 170, 510 140, 580 130" fill="none" stroke="#7F1D1D" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
    <path d="M 520 230 C 560 210, 620 200, 670 215" fill="none" stroke="#991B1B" stroke-width="3.5" stroke-linecap="round"/>

    <!-- Inferior Temporal Arcade -->
    <path d="M 240 405 C 270 490, 370 590, 530 570 C 610 560, 690 510, 745 430" fill="none" stroke="#7F1D1D" stroke-width="9" stroke-linecap="round" filter="blur(0.5px)" opacity="0.9"/>
    <path d="M 240 405 C 270 490, 370 590, 530 570 C 610 560, 690 510, 745 430" fill="none" stroke="#991B1B" stroke-width="5" stroke-linecap="round"/>
    <path d="M 410 580 C 460 630, 530 660, 600 670" fill="none" stroke="#7F1D1D" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
    
    <!-- Nasal Vessels -->
    <path d="M 235 390 C 180 340, 130 310, 70 290" fill="none" stroke="#7F1D1D" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
    <path d="M 235 410 C 180 460, 130 490, 70 510" fill="none" stroke="#7F1D1D" stroke-width="6" stroke-linecap="round" opacity="0.85"/>

    <!-- Fine macular arterioles and venules -->
    <path d="M 370 300 C 420 330, 460 360, 490 385" fill="none" stroke="#B91C1C" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
    <path d="M 380 500 C 430 470, 470 440, 495 415" fill="none" stroke="#B91C1C" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
  `;

  const arcadeArchOS = `
    <!-- Superior Temporal Arcade (Left Eye) -->
    <path d="M 560 395 C 530 310, 440 210, 280 230 C 200 240, 120 290, 60 370" fill="none" stroke="#7F1D1D" stroke-width="9" stroke-linecap="round" filter="blur(0.5px)" opacity="0.9"/>
    <path d="M 560 395 C 530 310, 440 210, 280 230 C 200 240, 120 290, 60 370" fill="none" stroke="#991B1B" stroke-width="5" stroke-linecap="round"/>
    
    <!-- Inferior Temporal Arcade -->
    <path d="M 560 405 C 530 490, 430 590, 270 570 C 190 560, 110 510, 55 430" fill="none" stroke="#7F1D1D" stroke-width="9" stroke-linecap="round" filter="blur(0.5px)" opacity="0.9"/>
    <path d="M 560 405 C 530 490, 430 590, 270 570 C 190 560, 110 510, 55 430" fill="none" stroke="#991B1B" stroke-width="5" stroke-linecap="round"/>
  `;

  // Specific lesion elements based on DR grade
  let lesionsSvg = "";

  if (grade >= 1) {
    // Microaneurysms
    lesionsSvg += `
      <!-- Microaneurysms -->
      <circle cx="${maculaX - 45}" cy="${maculaY - 35}" r="3" fill="#DC2626" stroke="#991B1B" stroke-width="0.5"/>
      <circle cx="${maculaX + 55}" cy="${maculaY + 25}" r="2.5" fill="#DC2626" stroke="#991B1B" stroke-width="0.5"/>
      <circle cx="${maculaX - 30}" cy="${maculaY + 48}" r="3" fill="#EF4444" stroke="#991B1B" stroke-width="0.5"/>
      <circle cx="${maculaX + 70}" cy="${maculaY - 50}" r="2.8" fill="#DC2626"/>
    `;
  }

  if (grade >= 2) {
    // Blot hemorrhages and hard exudates
    lesionsSvg += `
      <!-- Dot & Blot Hemorrhages -->
      <ellipse cx="${maculaX + 90}" cy="${maculaY - 20}" rx="9" ry="7" fill="#7F1D1D" opacity="0.95"/>
      <ellipse cx="${maculaX - 80}" cy="${maculaY + 60}" rx="12" ry="9" fill="#991B1B" opacity="0.9"/>
      <ellipse cx="${maculaX + 40}" cy="${maculaY + 80}" rx="8" ry="6" fill="#7F1D1D" opacity="0.95"/>
      
      <!-- Hard Exudates (Lipid clusters) -->
      <circle cx="${maculaX + 60}" cy="${maculaY - 80}" r="4" fill="#FEF08A" stroke="#FACC15" stroke-width="1"/>
      <circle cx="${maculaX + 68}" cy="${maculaY - 76}" r="3.5" fill="#FEF08A" stroke="#FACC15" stroke-width="1"/>
      <circle cx="${maculaX + 76}" cy="${maculaY - 84}" r="4.5" fill="#FEF08A" stroke="#FACC15" stroke-width="1"/>
      <circle cx="${maculaX + 83}" cy="${maculaY - 78}" r="3" fill="#FEF08A" stroke="#FACC15" stroke-width="1"/>
      
      <!-- Cotton wool spot -->
      <ellipse cx="${maculaX - 70}" cy="${maculaY - 85}" rx="14" ry="10" fill="#F8FAFC" opacity="0.7" filter="blur(1px)"/>
    `;
  }

  if (grade >= 3) {
    // Severe NPDR: 4-quadrant hemorrhages, venous beading, prominent cotton wool spots
    lesionsSvg += `
      <!-- Extensive hemorrhages -->
      <ellipse cx="${maculaX - 110}" cy="${maculaY - 120}" rx="18" ry="12" fill="#7F1D1D" opacity="0.95"/>
      <ellipse cx="${maculaX + 130}" cy="${maculaY + 110}" rx="16" ry="11" fill="#7F1D1D" opacity="0.95"/>
      <ellipse cx="200" cy="220" rx="14" ry="10" fill="#991B1B" opacity="0.9"/>
      <ellipse cx="210" cy="580" rx="15" ry="11" fill="#7F1D1D" opacity="0.9"/>
      
      <!-- Multiple cotton wool spots -->
      <ellipse cx="${maculaX + 100}" cy="${maculaY + 40}" rx="18" ry="12" fill="#FFFFFF" opacity="0.75" filter="blur(1.5px)"/>
      <ellipse cx="${maculaX - 120}" cy="${maculaY + 30}" rx="15" ry="10" fill="#FFFFFF" opacity="0.75" filter="blur(1.5px)"/>
      <ellipse cx="320" cy="240" rx="16" ry="12" fill="#FFFFFF" opacity="0.8" filter="blur(1.5px)"/>

      <!-- Venous beading on upper arcade -->
      <circle cx="450" cy="215" r="7" fill="#7F1D1D" opacity="0.9"/>
      <circle cx="475" cy="222" r="8" fill="#7F1D1D" opacity="0.9"/>
      <circle cx="500" cy="228" r="6" fill="#7F1D1D" opacity="0.9"/>
    `;
  }

  if (grade === 4) {
    // Proliferative DR: Neovascularization and flame preretinal hemorrhages
    lesionsSvg += `
      <!-- Neovascularization at the Disc (NVD) -->
      <g stroke="#EF4444" stroke-width="1.8" fill="none" opacity="0.95">
        <path d="M ${discX - 10} ${discY - 10} Q ${discX - 25} ${discY - 30} ${discX - 5} ${discY - 45}"/>
        <path d="M ${discX + 5} ${discY - 15} Q ${discX + 25} ${discY - 35} ${discX + 15} ${discY - 50}"/>
        <path d="M ${discX - 5} ${discY + 10} Q ${discX - 30} ${discY + 25} ${discX - 15} ${discY + 40}"/>
        <path d="M ${discX + 10} ${discY + 5} Q ${discX + 30} ${discY + 20} ${discX + 20} ${discY + 38}"/>
      </g>
      
      <!-- Large Flame & Preretinal Sub-hyaloid Hemorrhage (boat-shaped) -->
      <path d="M ${maculaX - 40} ${maculaY + 70} C ${maculaX} ${maculaY + 50}, ${maculaX + 80} ${maculaY + 55}, ${maculaX + 110} ${maculaY + 80} C ${maculaX + 80} ${maculaY + 120}, ${maculaX - 10} ${maculaY + 120}, ${maculaX - 40} ${maculaY + 70} Z" fill="#991B1B" stroke="#7F1D1D" stroke-width="2" opacity="0.95"/>
      <ellipse cx="${maculaX + 140}" cy="${maculaY - 70}" rx="24" ry="14" fill="#7F1D1D" opacity="0.95"/>
      <ellipse cx="${maculaX - 130}" cy="${maculaY - 100}" rx="22" ry="15" fill="#7F1D1D" opacity="0.95"/>
    `;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>${bgGrad}</defs>
      <!-- Circular fundus mask -->
      <circle cx="400" cy="400" r="390" fill="url(#fundusGlow)" stroke="#1F2937" stroke-width="6"/>
      
      <!-- Retinal background texture -->
      <ellipse cx="400" cy="400" rx="350" ry="350" fill="#9A3412" opacity="0.25"/>

      <!-- Optic Nerve Head (Disc) -->
      <ellipse cx="${discX}" cy="${discY}" rx="42" ry="52" fill="url(#discGlow)" stroke="#CA8A04" stroke-width="1.5"/>
      <ellipse cx="${discX + (isOD ? -4 : 4)}" cy="${discY}" rx="20" ry="26" fill="#FEF9C3" opacity="0.8"/>

      <!-- Vascular Network -->
      ${isOD ? arcadeArchOD : arcadeArchOS}

      <!-- Macula & Fovea -->
      <ellipse cx="${maculaX}" cy="${maculaY}" rx="55" ry="55" fill="url(#maculaGlow)"/>
      <circle cx="${maculaX}" cy="${maculaY}" r="6" fill="#3B1207" opacity="0.9"/>
      <circle cx="${maculaX}" cy="${maculaY}" r="1.5" fill="#FDE047" opacity="0.6"/>

      <!-- Pathology Overlays -->
      ${lesionsSvg}

      <!-- Lens Edge Vignette -->
      <circle cx="400" cy="400" r="388" fill="none" stroke="#000000" stroke-width="24" opacity="0.4"/>
      <circle cx="400" cy="400" r="390" fill="none" stroke="#041214" stroke-width="8"/>
    </svg>
  `.trim();

  // Convert SVG to base64 Data URL
  const base64 = typeof window !== "undefined" 
    ? btoa(unescape(encodeURIComponent(svgContent))) 
    : Buffer.from(svgContent).toString("base64");

  return `data:image/svg+xml;base64,${base64}`;
}
