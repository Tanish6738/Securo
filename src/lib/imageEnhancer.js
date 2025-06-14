// Image processing utilities for browser-based enhancement
export class ImageEnhancer {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  // Load image from file or data URL
  async loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => img.src = e.target.result;
        reader.readAsDataURL(source);
      } else {
        img.src = source;
      }
    });
  }

  // Advanced bicubic interpolation for better upscaling
  bicubicUpscale(imageData, newWidth, newHeight) {
    const { data, width, height } = imageData;
    const newImageData = new ImageData(newWidth, newHeight);
    const newData = newImageData.data;
    
    const scaleX = width / newWidth;
    const scaleY = height / newHeight;
    
    // Bicubic kernel function
    const cubic = (t) => {
      const a = -0.5;
      const absT = Math.abs(t);
      if (absT <= 1) {
        return (a + 2) * Math.pow(absT, 3) - (a + 3) * Math.pow(absT, 2) + 1;
      } else if (absT <= 2) {
        return a * Math.pow(absT, 3) - 5 * a * Math.pow(absT, 2) + 8 * a * absT - 4 * a;
      }
      return 0;
    };

    for (let dy = 0; dy < newHeight; dy++) {
      for (let dx = 0; dx < newWidth; dx++) {
        const srcX = dx * scaleX;
        const srcY = dy * scaleY;
        
        const x = Math.floor(srcX);
        const y = Math.floor(srcY);
        
        for (let c = 0; c < 4; c++) {
          let sum = 0;
          let weightSum = 0;
          
          for (let ky = -1; ky <= 2; ky++) {
            for (let kx = -1; kx <= 2; kx++) {
              const px = Math.max(0, Math.min(width - 1, x + kx));
              const py = Math.max(0, Math.min(height - 1, y + ky));
              
              const weight = cubic(srcX - (x + kx)) * cubic(srcY - (y + ky));
              const pixelIndex = (py * width + px) * 4 + c;
              
              sum += data[pixelIndex] * weight;
              weightSum += weight;
            }
          }
          
          const resultIndex = (dy * newWidth + dx) * 4 + c;
          newData[resultIndex] = Math.max(0, Math.min(255, sum / weightSum));
        }
      }
    }
    
    return newImageData;
  }

  // Lanczos resampling for high-quality scaling
  lanczosUpscale(imageData, newWidth, newHeight, a = 3) {
    const { data, width, height } = imageData;
    const newImageData = new ImageData(newWidth, newHeight);
    const newData = newImageData.data;
    
    const scaleX = width / newWidth;
    const scaleY = height / newHeight;
    
    // Lanczos kernel
    const lanczos = (x) => {
      if (x === 0) return 1;
      if (Math.abs(x) >= a) return 0;
      const piX = Math.PI * x;
      return (a * Math.sin(piX) * Math.sin(piX / a)) / (piX * piX);
    };

    for (let dy = 0; dy < newHeight; dy++) {
      for (let dx = 0; dx < newWidth; dx++) {
        const srcX = dx * scaleX;
        const srcY = dy * scaleY;
        
        const x = Math.floor(srcX);
        const y = Math.floor(srcY);
        
        for (let c = 0; c < 4; c++) {
          let sum = 0;
          let weightSum = 0;
          
          for (let ky = Math.max(0, y - a + 1); ky <= Math.min(height - 1, y + a); ky++) {
            for (let kx = Math.max(0, x - a + 1); kx <= Math.min(width - 1, x + a); kx++) {
              const weight = lanczos(srcX - kx) * lanczos(srcY - ky);
              const pixelIndex = (ky * width + kx) * 4 + c;
              
              sum += data[pixelIndex] * weight;
              weightSum += weight;
            }
          }
          
          const resultIndex = (dy * newWidth + dx) * 4 + c;
          newData[resultIndex] = weightSum > 0 ? Math.max(0, Math.min(255, sum / weightSum)) : 0;
        }
      }
    }
    
    return newImageData;
  }

  // Edge-preserving denoising
  edgePreservingDenoise(imageData, strength, threshold = 30) {
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data);
    const radius = Math.max(1, Math.floor(strength / 30));
    
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        for (let c = 0; c < 3; c++) {
          const centerIdx = (y * width + x) * 4 + c;
          const centerValue = data[centerIdx];
          
          let sum = 0;
          let count = 0;
          let weightSum = 0;
          
          for (let ky = -radius; ky <= radius; ky++) {
            for (let kx = -radius; kx <= radius; kx++) {
              const nx = x + kx;
              const ny = y + ky;
              const idx = (ny * width + nx) * 4 + c;
              const value = data[idx];
              
              // Edge-preserving weight based on value difference
              const diff = Math.abs(value - centerValue);
              const weight = diff < threshold ? Math.exp(-diff * diff / (2 * threshold * threshold)) : 0;
              
              sum += value * weight;
              weightSum += weight;
              count++;
            }
          }
          
          if (weightSum > 0) {
            const denoisedValue = sum / weightSum;
            const blendFactor = Math.min(1, strength / 100);
            newData[centerIdx] = centerValue * (1 - blendFactor) + denoisedValue * blendFactor;
          }
        }
      }
    }
    
    return new ImageData(newData, width, height);
  }

  // Unsharp mask sharpening
  unsharpMask(imageData, amount, radius = 1, threshold = 0) {
    const { data, width, height } = imageData;
    const blurred = this.gaussianBlur(imageData, radius);
    const newData = new Uint8ClampedArray(data);
    
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const original = data[i + c];
        const blurredValue = blurred.data[i + c];
        const diff = original - blurredValue;
        
        if (Math.abs(diff) > threshold) {
          const sharpened = original + (diff * amount / 100);
          newData[i + c] = Math.max(0, Math.min(255, sharpened));
        } else {
          newData[i + c] = original;
        }
      }
      newData[i + 3] = data[i + 3]; // Alpha channel
    }
    
    return new ImageData(newData, width, height);
  }

  // Gaussian blur for unsharp mask
  gaussianBlur(imageData, radius) {
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data);
    
    // Generate Gaussian kernel
    const kernelSize = Math.ceil(radius * 3) * 2 + 1;
    const kernel = [];
    let kernelSum = 0;
    
    for (let i = 0; i < kernelSize; i++) {
      const x = i - Math.floor(kernelSize / 2);
      const value = Math.exp(-(x * x) / (2 * radius * radius));
      kernel[i] = value;
      kernelSum += value;
    }
    
    // Normalize kernel
    for (let i = 0; i < kernelSize; i++) {
      kernel[i] /= kernelSum;
    }
    
    const halfKernel = Math.floor(kernelSize / 2);
    
    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          
          for (let k = 0; k < kernelSize; k++) {
            const px = Math.max(0, Math.min(width - 1, x + k - halfKernel));
            const idx = (y * width + px) * 4 + c;
            sum += data[idx] * kernel[k];
          }
          
          newData[(y * width + x) * 4 + c] = sum;
        }
      }
    }
    
    // Vertical pass
    const tempData = new Uint8ClampedArray(newData);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          
          for (let k = 0; k < kernelSize; k++) {
            const py = Math.max(0, Math.min(height - 1, y + k - halfKernel));
            const idx = (py * width + x) * 4 + c;
            sum += tempData[idx] * kernel[k];
          }
          
          newData[(y * width + x) * 4 + c] = sum;
        }
      }
    }
    
    return new ImageData(newData, width, height);
  }

  // Color enhancement with selective adjustments
  enhanceColors(imageData, options = {}) {
    const {
      brightness = 0,
      contrast = 0,
      saturation = 0,
      gamma = 1,
      highlights = 0,
      shadows = 0,
      vibrance = 0
    } = options;
    
    const { data } = imageData;
    const newData = new Uint8ClampedArray(data);
    
    // Pre-calculate contrast factor
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      
      // Gamma correction
      if (gamma !== 1) {
        r = 255 * Math.pow(r / 255, 1 / gamma);
        g = 255 * Math.pow(g / 255, 1 / gamma);
        b = 255 * Math.pow(b / 255, 1 / gamma);
      }
      
      // Shadows and highlights
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      const shadowFactor = Math.max(0, Math.min(1, (128 - luminance) / 128));
      const highlightFactor = Math.max(0, Math.min(1, (luminance - 128) / 128));
      
      r += shadows * shadowFactor + highlights * highlightFactor;
      g += shadows * shadowFactor + highlights * highlightFactor;
      b += shadows * shadowFactor + highlights * highlightFactor;
      
      // Brightness
      r += brightness;
      g += brightness;
      b += brightness;
      
      // Contrast
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
      
      // Saturation and vibrance
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Regular saturation
      if (saturation !== 0) {
        r = gray + (saturation / 100 + 1) * (r - gray);
        g = gray + (saturation / 100 + 1) * (g - gray);
        b = gray + (saturation / 100 + 1) * (b - gray);
      }
      
      // Vibrance (affects less saturated colors more)
      if (vibrance !== 0) {
        const maxColor = Math.max(r, g, b);
        const avgColor = (r + g + b) / 3;
        const amt = Math.abs(maxColor - avgColor) / 255;
        const vibranceAmt = vibrance / 100 * (1 - amt);
        
        r = gray + (vibranceAmt + 1) * (r - gray);
        g = gray + (vibranceAmt + 1) * (g - gray);
        b = gray + (vibranceAmt + 1) * (b - gray);
      }
      
      // Clamp values
      newData[i] = Math.max(0, Math.min(255, r));
      newData[i + 1] = Math.max(0, Math.min(255, g));
      newData[i + 2] = Math.max(0, Math.min(255, b));
      newData[i + 3] = data[i + 3]; // Preserve alpha
    }
    
    return new ImageData(newData, imageData.width, imageData.height);
  }

  // AI-inspired edge enhancement
  enhanceEdges(imageData, strength = 50) {
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data);
    
    // Sobel edge detection kernels
    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let gx = 0, gy = 0;
          
          // Apply Sobel operators
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const pixel = data[idx];
              
              gx += pixel * sobelX[ky + 1][kx + 1];
              gy += pixel * sobelY[ky + 1][kx + 1];
            }
          }
          
          // Calculate edge magnitude
          const magnitude = Math.sqrt(gx * gx + gy * gy);
          const enhancement = magnitude * strength / 100;
          
          // Enhance original pixel
          const originalIdx = (y * width + x) * 4 + c;
          const enhanced = data[originalIdx] + enhancement;
          newData[originalIdx] = Math.max(0, Math.min(255, enhanced));
        }
      }
    }
    
    return new ImageData(newData, width, height);
  }

  // Process image with all enhancements
  async processImage(image, settings) {
    const {
      scale = 1,
      method = 'bicubic',
      denoise = 0,
      sharpen = 0,
      brightness = 0,
      contrast = 0,
      saturation = 0,
      gamma = 1,
      highlights = 0,
      shadows = 0,
      vibrance = 0,
      edgeEnhancement = 0
    } = settings;

    // Set up canvas
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.ctx.drawImage(image, 0, 0);
    
    let imageData = this.ctx.getImageData(0, 0, image.width, image.height);
    
    // 1. Upscaling (if needed)
    if (scale > 1) {
      const newWidth = Math.floor(image.width * scale);
      const newHeight = Math.floor(image.height * scale);
      
      if (method === 'bicubic') {
        imageData = this.bicubicUpscale(imageData, newWidth, newHeight);
      } else if (method === 'lanczos') {
        imageData = this.lanczosUpscale(imageData, newWidth, newHeight);
      } else {
        // Use browser's built-in scaling
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.drawImage(image, 0, 0, newWidth, newHeight);
        imageData = this.ctx.getImageData(0, 0, newWidth, newHeight);
      }
      
      this.canvas.width = imageData.width;
      this.canvas.height = imageData.height;
    }
    
    // 2. Denoising
    if (denoise > 0) {
      imageData = this.edgePreservingDenoise(imageData, denoise);
    }
    
    // 3. Color enhancements
    if (brightness !== 0 || contrast !== 0 || saturation !== 0 || gamma !== 1 || highlights !== 0 || shadows !== 0 || vibrance !== 0) {
      imageData = this.enhanceColors(imageData, {
        brightness, contrast, saturation, gamma, highlights, shadows, vibrance
      });
    }
    
    // 4. Edge enhancement
    if (edgeEnhancement > 0) {
      imageData = this.enhanceEdges(imageData, edgeEnhancement);
    }
    
    // 5. Sharpening (applied last)
    if (sharpen > 0) {
      imageData = this.unsharpMask(imageData, sharpen);
    }
    
    // Put processed image data back to canvas
    this.ctx.putImageData(imageData, 0, 0);
    
    // Return as data URL
    return this.canvas.toDataURL('image/png', 1.0);
  }
}

// Export utility functions
export const downloadImage = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getImageMetadata = async (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
        aspectRatio: img.width / img.height
      });
    };
    
    const reader = new FileReader();
    reader.onload = (e) => img.src = e.target.result;
    reader.readAsDataURL(file);
  });
};

export const compressImage = (dataUrl, quality = 0.8) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.src = dataUrl;
  });
};
