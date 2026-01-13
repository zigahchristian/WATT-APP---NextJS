// lib/fonts.ts
import localFont from "next/font/local";

// Nunito Sans local font setup
export const nunito = localFont({
  src: [
    {
      path: "../public/fonts/nunito-sans/NunitoSans-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/nunito-sans/NunitoSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/nunito-sans/NunitoSans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/nunito-sans/NunitoSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-nunito",
  display: "swap",
});

// Lora local font setup
export const lora = localFont({
  src: [
    {
      path: "../public/fonts/lora/Lora-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/lora/Lora-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/lora/Lora-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-lora",
  display: "swap",
});
