'use client'

import Button from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function CTASection() {
  const [isClient, setIsClient] = useState(false)
  const [particlePositions, setParticlePositions] = useState([])

  const floatingElements = [
    { x: 10, y: 10, delay: 0, size: 'w-16 h-16' },
    { x: -20, y: 20, delay: 1, size: 'w-12 h-12' },
    { x: 30, y: -15, delay: 2, size: 'w-20 h-20' }
  ]

  // Generate particle positions on client-side only
  useEffect(() => {
    setIsClient(true)
    const positions = Array.from({ length: 6 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100
    }))
    setParticlePositions(positions)
  }, [])

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 overflow-hidden">
      {/* Animated background elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.size} rounded-full bg-white/10 blur-xl`}
          animate={{
            x: [element.x, element.x + 30, element.x],
            y: [element.y, element.y - 20, element.y],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 8,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            left: `${10 + index * 25}%`,
            top: `${20 + index * 20}%`
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center"
        >
          <motion.h2 
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to Secure Your Privacy?
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join thousands of users who trust PrivacyGuard to protect their digital identity.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative inline-block"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="relative bg-white text-blue-600 hover:bg-blue-50 border-white text-lg px-10 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Start Free Trial
                  <motion.span
                    className="ml-2 inline-block"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>            {/* Floating particles around button */}
            {isClient && particlePositions.map((position, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{
                  left: `${position.left}%`,
                  top: `${position.top}%`
                }}
                animate={{
                  y: [-10, -30, -10],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-blue-100"
          >
            <div className="flex items-center">
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full mr-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm">SSL Encrypted</span>
            </div>
            <div className="flex items-center">
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full mr-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
              />
              <span className="text-sm">GDPR Compliant</span>
            </div>
            <div className="flex items-center">
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full mr-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, delay: 1, repeat: Infinity }}
              />
              <span className="text-sm">No Credit Card Required</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
