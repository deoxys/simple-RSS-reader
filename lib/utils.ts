import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseHtmlEntities(str: string): string {
  return str.replace(/&#([0-9]{1,4});/gi, function(match, numStr) {
      const num = parseInt(numStr, 10)
      return String.fromCharCode(num)
  })
}
