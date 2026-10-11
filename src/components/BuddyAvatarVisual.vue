<script setup>
defineProps({
  buddyId: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 200
  }
})
</script>

<template>
  <div class="buddy-avatar-visual" :style="{ width: `${size}px`, height: `${size}px` }">
    <!-- ORBIT: Planet with Ring, Star & Big Eyes -->
    <svg
      v-if="buddyId === 'orbit'"
      viewBox="0 0 240 240"
      class="clay-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="orbit-body" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stop-color="#d6edff" />
          <stop offset="35%" stop-color="#84b8fe" />
          <stop offset="70%" stop-color="#b695fe" />
          <stop offset="100%" stop-color="#e8a8d8" />
        </radialGradient>
        <radialGradient id="orbit-ring" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="45%" stop-color="#80d5ff" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#b798ff" stop-opacity="0.8" />
        </radialGradient>
        <radialGradient id="orbit-star" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#fff9d6" />
          <stop offset="50%" stop-color="#ffd54f" />
          <stop offset="100%" stop-color="#ffb300" />
        </radialGradient>
        <filter id="clay-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#051838" flood-opacity="0.35" />
        </filter>
        <filter id="star-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#ffd54f" flood-opacity="0.7" />
        </filter>
      </defs>

      <!-- Back Half of the Planetary Ring -->
      <g filter="url(#clay-shadow)">
        <path
          d="M 22 135 C 16 110, 190 70, 222 95"
          fill="none"
          stroke="url(#orbit-ring)"
          stroke-width="17"
          stroke-linecap="round"
        />
      </g>

      <!-- Planet Sphere -->
      <circle
        cx="124"
        cy="118"
        r="68"
        fill="url(#orbit-body)"
        filter="url(#clay-shadow)"
      />

      <!-- Specular Highlight Curve on Sphere Top-Left -->
      <path
        d="M 78 88 A 62 62 0 0 1 146 58"
        fill="none"
        stroke="#ffffff"
        stroke-width="7"
        stroke-linecap="round"
        opacity="0.75"
      />

      <!-- Eyes on the Planet -->
      <g class="eyes-group" transform="translate(108, 116)">
        <!-- Left Eye -->
        <ellipse cx="6" cy="0" rx="9" ry="13" fill="#141824" />
        <circle cx="9" cy="-4" r="4.2" fill="#ffffff" />
        <circle cx="4" cy="4" r="2.2" fill="#ffffff" />

        <!-- Right Eye -->
        <ellipse cx="26" cy="0" rx="9" ry="13" fill="#141824" />
        <circle cx="29" cy="-4" r="4.2" fill="#ffffff" />
        <circle cx="24" cy="4" r="2.2" fill="#ffffff" />
      </g>

      <!-- Front Half of the Planetary Ring -->
      <g filter="url(#clay-shadow)">
        <path
          d="M 22 135 C 26 168, 185 142, 222 95"
          fill="none"
          stroke="url(#orbit-ring)"
          stroke-width="17"
          stroke-linecap="round"
        />
        <!-- Inner ring light reflection -->
        <path
          d="M 40 142 C 55 162, 165 142, 204 105"
          fill="none"
          stroke="#ffffff"
          stroke-width="4"
          stroke-linecap="round"
          opacity="0.85"
        />
      </g>

      <!-- Star Badge on Upper-Left -->
      <g transform="translate(68, 70)" filter="url(#star-glow)">
        <path
          d="M 0 -18 Q 0 0 18 0 Q 0 0 0 18 Q 0 0 -18 0 Q 0 0 0 -18 Z"
          fill="url(#orbit-star)"
        />
        <circle cx="0" cy="0" r="4" fill="#ffffff" opacity="0.8" />
      </g>
    </svg>

    <!-- DUMMIES: Retro Computer Robot with Ring & Eyes -->
    <svg
      v-else-if="buddyId === 'dummies'"
      viewBox="0 0 240 240"
      class="clay-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="crt-casing" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="40%" stop-color="#edeef3" />
          <stop offset="100%" stop-color="#cbd0db" />
        </linearGradient>
        <radialGradient id="crt-ring" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="45%" stop-color="#4ed8ff" />
          <stop offset="100%" stop-color="#0284c7" />
        </radialGradient>
        <filter id="dummies-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="13" flood-color="#3d0e14" flood-opacity="0.35" />
        </filter>
      </defs>

      <!-- Antenna -->
      <g transform="translate(120, 48)">
        <circle cx="0" cy="0" r="8" fill="#4ed8ff" filter="url(#dummies-shadow)" />
        <rect x="-3" y="6" width="6" height="20" rx="3" fill="#9ba3b4" />
      </g>

      <!-- Back Half of floating ring around the robot -->
      <path
        d="M 32 144 C 28 116, 204 88, 218 116"
        fill="none"
        stroke="url(#crt-ring)"
        stroke-width="14"
        stroke-linecap="round"
        opacity="0.9"
      />

      <!-- Robot Body Casing -->
      <rect
        x="66"
        y="68"
        width="112"
        height="114"
        rx="36"
        fill="url(#crt-casing)"
        filter="url(#dummies-shadow)"
      />

      <!-- Accent Ear / Knob -->
      <rect x="58" y="104" width="9" height="22" rx="4" fill="#ff707e" />
      <rect x="177" y="104" width="9" height="22" rx="4" fill="#ff707e" />

      <!-- Screen Frame & Bezel -->
      <rect
        x="80"
        y="82"
        width="84"
        height="64"
        rx="22"
        fill="#1d222e"
      />

      <!-- Screen Highlights -->
      <path
        d="M 88 90 Q 120 86 156 90"
        stroke="rgba(255,255,255,0.25)"
        stroke-width="3"
        fill="none"
      />

      <!-- Big Robot Eyes on Screen -->
      <g class="eyes-group" transform="translate(98, 114)">
        <ellipse cx="6" cy="0" rx="8" ry="11" fill="#46e3ff" />
        <ellipse cx="6" cy="0" rx="5" ry="7" fill="#082b3d" />
        <circle cx="8" cy="-3" r="3.5" fill="#ffffff" />

        <ellipse cx="28" cy="0" rx="8" ry="11" fill="#46e3ff" />
        <ellipse cx="28" cy="0" rx="5" ry="7" fill="#082b3d" />
        <circle cx="30" cy="-3" r="3.5" fill="#ffffff" />
      </g>

      <!-- Bottom Grill & Buttons -->
      <circle cx="106" cy="162" r="4.5" fill="#ff6474" />
      <circle cx="120" cy="162" r="4.5" fill="#ffb444" />
      <circle cx="134" cy="162" r="4.5" fill="#4ed8ff" />

      <!-- Front Half of floating ring -->
      <g filter="url(#dummies-shadow)">
        <path
          d="M 32 144 C 36 178, 196 152, 218 116"
          fill="none"
          stroke="url(#crt-ring)"
          stroke-width="14"
          stroke-linecap="round"
        />
        <path
          d="M 50 152 C 68 174, 172 152, 202 122"
          fill="none"
          stroke="#ffffff"
          stroke-width="3.5"
          stroke-linecap="round"
          opacity="0.8"
        />
      </g>
    </svg>

    <!-- SUNNY: Sunflower with 3D Petals & Big Eyes -->
    <svg
      v-else-if="buddyId === 'sunny'"
      viewBox="0 0 240 240"
      class="clay-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sun-petal" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#fff7a8" />
          <stop offset="45%" stop-color="#ffca28" />
          <stop offset="100%" stop-color="#f57f17" />
        </radialGradient>
        <radialGradient id="sun-center" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stop-color="#6d4c41" />
          <stop offset="60%" stop-color="#3e2723" />
          <stop offset="100%" stop-color="#211513" />
        </radialGradient>
        <filter id="sunny-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="13" flood-color="#143b1c" flood-opacity="0.38" />
        </filter>
      </defs>

      <!-- Green Stem and Leaf at Bottom -->
      <g filter="url(#sunny-shadow)">
        <path
          d="M 120 160 Q 120 210 120 226"
          stroke="#43a047"
          stroke-width="18"
          stroke-linecap="round"
        />
        <path
          d="M 122 188 C 158 172 188 200 178 214 C 150 220 124 196 122 188 Z"
          fill="#66bb6a"
        />
        <path
          d="M 118 194 C 82 178 54 206 64 218 C 92 222 116 200 118 194 Z"
          fill="#4caf50"
        />
      </g>

      <!-- 12 Petals Arranged in Circle -->
      <g filter="url(#sunny-shadow)" transform="translate(120, 118)">
        <template v-for="i in 12" :key="i">
          <ellipse
            cx="0"
            cy="-56"
            rx="16"
            ry="30"
            fill="url(#sun-petal)"
            :transform="`rotate(${(i - 1) * 30})`"
          />
        </template>
      </g>

      <!-- Dark Seed Center Sphere -->
      <circle
        cx="120"
        cy="118"
        r="44"
        fill="url(#sun-center)"
        filter="url(#sunny-shadow)"
      />

      <!-- Specular Highlight Curve on Center -->
      <path
        d="M 94 96 A 38 38 0 0 1 138 78"
        fill="none"
        stroke="#ffffff"
        stroke-width="4.5"
        stroke-linecap="round"
        opacity="0.5"
      />

      <!-- Big Eyes on Sunflower -->
      <g class="eyes-group" transform="translate(104, 118)">
        <ellipse cx="6" cy="0" rx="9" ry="13" fill="#141824" />
        <circle cx="9" cy="-4" r="4.2" fill="#ffffff" />
        <circle cx="4" cy="4" r="2.2" fill="#ffffff" />

        <ellipse cx="26" cy="0" rx="9" ry="13" fill="#141824" />
        <circle cx="29" cy="-4" r="4.2" fill="#ffffff" />
        <circle cx="24" cy="4" r="2.2" fill="#ffffff" />
      </g>
    </svg>

    <!-- CLOUDY: Fluffy Cloud with Sun & Cheerful Eyes -->
    <svg
      v-else-if="buddyId === 'cloudy'"
      viewBox="0 0 240 240"
      class="clay-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="cloud-sun" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fff8cc" />
          <stop offset="45%" stop-color="#ffb74d" />
          <stop offset="100%" stop-color="#f57c00" />
        </radialGradient>
        <radialGradient id="cloud-puff" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="55%" stop-color="#e8edfb" />
          <stop offset="100%" stop-color="#c6d2f3" />
        </radialGradient>
        <filter id="cloudy-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="13" flood-color="#242154" flood-opacity="0.32" />
        </filter>
      </defs>

      <!-- Golden Sun Peeking from Behind Left Cloud -->
      <g filter="url(#cloudy-shadow)">
        <circle cx="76" cy="94" r="38" fill="url(#cloud-sun)" />
        <!-- Sun Rays -->
        <g stroke="#ffa726" stroke-width="6" stroke-linecap="round">
          <line x1="76" y1="42" x2="76" y2="30" />
          <line x1="38" y1="56" x2="30" y2="50" />
          <line x1="24" y1="94" x2="12" y2="94" />
          <line x1="38" y1="132" x2="30" y2="138" />
        </g>
      </g>

      <!-- Puffy Cloud Body (Multiple overlapping clay spheres) -->
      <g filter="url(#cloudy-shadow)">
        <circle cx="74" cy="144" r="34" fill="url(#cloud-puff)" />
        <circle cx="166" cy="146" r="32" fill="url(#cloud-puff)" />
        <circle cx="118" cy="118" r="44" fill="url(#cloud-puff)" />
        <rect x="74" y="132" width="94" height="42" rx="20" fill="url(#cloud-puff)" />
      </g>

      <!-- Cloud Highlights -->
      <path
        d="M 96 92 A 38 38 0 0 1 144 94"
        fill="none"
        stroke="#ffffff"
        stroke-width="5"
        stroke-linecap="round"
        opacity="0.8"
      />

      <!-- Soft Pink Cheeks -->
      <circle cx="90" cy="154" r="8" fill="#ffb4bc" opacity="0.6" />
      <circle cx="146" cy="154" r="8" fill="#ffb4bc" opacity="0.6" />

      <!-- Cute Eyes on Cloud -->
      <g class="eyes-group" transform="translate(104, 142)">
        <ellipse cx="6" cy="0" rx="8" ry="11" fill="#181c2e" />
        <circle cx="8" cy="-3" r="3.8" fill="#ffffff" />
        <circle cx="4" cy="3" r="1.8" fill="#ffffff" />

        <ellipse cx="26" cy="0" rx="8" ry="11" fill="#181c2e" />
        <circle cx="28" cy="-3" r="3.8" fill="#ffffff" />
        <circle cx="24" cy="3" r="1.8" fill="#ffffff" />
      </g>

      <!-- Gentle Smile -->
      <path
        d="M 115 156 Q 120 162 125 156"
        fill="none"
        stroke="#181c2e"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </svg>

    <!-- SWEETIE: Candy-Pink 3D Heart with Orbit & Sparkling Eyes -->
    <svg
      v-else-if="buddyId === 'sweetie'"
      viewBox="0 0 240 240"
      class="clay-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="heart-body" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffd5e7" />
          <stop offset="35%" stop-color="#ff7eb8" />
          <stop offset="80%" stop-color="#e8438e" />
          <stop offset="100%" stop-color="#b82168" />
        </radialGradient>
        <radialGradient id="sweet-ring" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#ffa6d2" />
          <stop offset="100%" stop-color="#e45e99" />
        </radialGradient>
        <filter id="sweetie-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="13" flood-color="#460721" flood-opacity="0.38" />
        </filter>
      </defs>

      <!-- Back Half of Ring -->
      <path
        d="M 28 142 C 22 118, 196 90, 214 116"
        fill="none"
        stroke="url(#sweet-ring)"
        stroke-width="15"
        stroke-linecap="round"
        opacity="0.85"
      />

      <!-- Plump 3D Clay Heart -->
      <g filter="url(#sweetie-shadow)" transform="translate(120, 126)">
        <path
          d="M 0 46 C -68 12, -74 -44, -38 -60 C -12 -70, 0 -38, 0 -32 C 0 -38, 12 -70, 38 -60 C 74 -44, 68 12, 0 46 Z"
          fill="url(#heart-body)"
        />
        <!-- Specular Highlights on Heart Lobes -->
        <path
          d="M -46 -42 A 22 22 0 0 1 -24 -56"
          fill="none"
          stroke="#ffffff"
          stroke-width="6"
          stroke-linecap="round"
          opacity="0.8"
        />
        <path
          d="M 24 -56 A 22 22 0 0 1 46 -42"
          fill="none"
          stroke="#ffffff"
          stroke-width="5"
          stroke-linecap="round"
          opacity="0.6"
        />
      </g>

      <!-- Floating Micro Heart on Top-Right -->
      <g transform="translate(182, 60) scale(0.38)">
        <path
          d="M 0 35 C -50 8, -55 -35, -28 -46 C -9 -54, 0 -28, 0 -24 C 0 -28, 9 -54, 28 -46 C 55 -35, 50 8, 0 35 Z"
          fill="#ff85be"
          filter="url(#sweetie-shadow)"
        />
      </g>

      <!-- Big Eyes on the Heart -->
      <g class="eyes-group" transform="translate(104, 118)">
        <ellipse cx="6" cy="0" rx="9" ry="13" fill="#141824" />
        <circle cx="9" cy="-4" r="4.2" fill="#ffffff" />
        <circle cx="4" cy="4" r="2.2" fill="#ffffff" />

        <ellipse cx="26" cy="0" rx="9" ry="13" fill="#141824" />
        <circle cx="29" cy="-4" r="4.2" fill="#ffffff" />
        <circle cx="24" cy="4" r="2.2" fill="#ffffff" />
      </g>

      <!-- Front Half of Ring -->
      <g filter="url(#sweetie-shadow)">
        <path
          d="M 28 142 C 32 174, 192 150, 214 116"
          fill="none"
          stroke="url(#sweet-ring)"
          stroke-width="15"
          stroke-linecap="round"
        />
        <path
          d="M 46 150 C 64 170, 168 148, 198 122"
          fill="none"
          stroke="#ffffff"
          stroke-width="4"
          stroke-linecap="round"
          opacity="0.85"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.buddy-avatar-visual {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  pointer-events: none;
}
.clay-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 16px 20px rgba(0, 0, 0, 0.28));
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.clay-svg:hover {
  transform: scale(1.05);
}
.eyes-group {
  animation: eye-idle 4.5s ease-in-out infinite;
  transform-origin: center;
}
@keyframes eye-idle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-1.5px);
  }
}
</style>
