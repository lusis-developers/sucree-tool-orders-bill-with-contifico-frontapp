import { ref, watchEffect } from 'vue'

const imageCache = new Map<string, string>()
const DEFAULT_PLACEHOLDER = 'https://nftcalendar.io/storage/uploads/2022/02/21/image-not-found_0221202211372462137974b6c1a.png'

export function useProductImage(imageUrl: string | undefined) {
  const imageSrc = ref<string>(DEFAULT_PLACEHOLDER)
  const isLoading = ref(false)
  const hasError = ref(false)

  const loadImage = (url: string) => {
    // If invalid URL, reset to placeholder
    if (!url) {
      imageSrc.value = DEFAULT_PLACEHOLDER
      return
    }

    // Check Cache (Browser cache handles standard URLs, but we track validity)
    if (imageCache.has(url)) {
      imageSrc.value = url
      return
    }

    isLoading.value = true
    hasError.value = false

    // Use standard Image object to preload and check validity without CORS fetch
    const img = new Image()
    img.referrerPolicy = 'no-referrer' // Try to bypass hotlink protection
    img.src = url

    img.onload = () => {
      imageSrc.value = url
      imageCache.set(url, 'valid') // Mark as valid in our map
      isLoading.value = false
    }

    img.onerror = (e) => {
      console.error('Image load error (hidden):', url)
      hasError.value = true
      imageSrc.value = DEFAULT_PLACEHOLDER
      isLoading.value = false
    }
  }

  watchEffect(() => {
    if (imageUrl) {
      loadImage(imageUrl)
    } else {
      imageSrc.value = DEFAULT_PLACEHOLDER
    }
  })

  return {
    imageSrc,
    isLoading,
    hasError
  }
}
