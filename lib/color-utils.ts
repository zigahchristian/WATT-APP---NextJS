// Color palette with harmonious colors for students
const colorPalette = [
  { hue: 210, name: "blue" }, // Blue
  { hue: 142, name: "green" }, // Green
  { hue: 270, name: "purple" }, // Purple
  { hue: 24, name: "orange" }, // Orange
  { hue: 330, name: "pink" }, // Pink
  { hue: 45, name: "yellow" }, // Yellow
  { hue: 174, name: "teal" }, // Teal
  { hue: 234, name: "indigo" }, // Indigo
  { hue: 0, name: "red" }, // Red
  { hue: 190, name: "cyan" }, // Cyan
]

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else if (h >= 300 && h < 360) {
    r = c
    g = 0
    b = x
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export interface StudentColors {
  tailwind: string // Tailwind classes for bg, border, and text
  bgHex: string // Background hex color
  textHex: string // Text hex color
  borderHex: string // Border hex color
}

// Generate matching colors based on student index or name
export function generateStudentColors(indexOrName: number | string): StudentColors {
  let index: number

  if (typeof indexOrName === "string") {
    // Generate consistent index from name string
    let hash = 0
    for (let i = 0; i < indexOrName.length; i++) {
      hash = indexOrName.charCodeAt(i) + ((hash << 5) - hash)
    }
    index = Math.abs(hash) % colorPalette.length
  } else {
    index = indexOrName % colorPalette.length
  }

  const { hue, name } = colorPalette[index]

  // Generate harmonious colors using HSL
  // Background: light (high lightness, low saturation)
  // Border: medium (medium lightness, medium saturation)
  // Text: dark (low lightness, high saturation)

  const bgHex = hslToHex(hue, 85, 92) // Light background
  const borderHex = hslToHex(hue, 65, 70) // Medium border
  const textHex = hslToHex(hue, 70, 30) // Dark text

  // Tailwind classes using the color name
  const tailwind = `bg-${name}-100 border-${name}-300 text-${name}-800`

  return {
    tailwind,
    bgHex,
    textHex,
    borderHex,
  }
}

// Generate a complete student color set from a custom hex color
export function generateColorsFromHex(baseHex: string): StudentColors {
  // Parse hex to RGB
  const hex = baseHex.replace("#", "")
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  // Convert RGB to HSL
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min)

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / (max - min) + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / (max - min) + 2) * 60
        break
      case b:
        h = ((r - g) / (max - min) + 4) * 60
        break
    }
  }

  // Generate matching colors
  const bgHex = hslToHex(h, 85, 92)
  const borderHex = hslToHex(h, 65, 70)
  const textHex = hslToHex(h, 70, 30)

  return {
    tailwind: "", // Custom colors don't map to Tailwind classes
    bgHex,
    textHex,
    borderHex,
  }
}

// Get all available color presets
export function getColorPresets(): Array<{ name: string; colors: StudentColors }> {
  return colorPalette.map((color, index) => ({
    name: color.name.charAt(0).toUpperCase() + color.name.slice(1),
    colors: generateStudentColors(index),
  }))
}
