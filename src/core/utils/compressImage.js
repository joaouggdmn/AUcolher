// Redimensiona e recomprime uma imagem no navegador, devolvendo um data URL
// JPEG leve. Fotos de celular em base64 passam fácil de 5 MB — o limite
// inteiro do localStorage que usamos como banco mockado
export function compressImage(file, { maxSize = 800, quality = 0.7 } = {}) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`Não foi possível ler a imagem ${file.name}`))
    }

    img.src = objectUrl
  })
}
