'use client'

import Button from '@/components/ui/Button'
import { motion } from 'framer-motion'

export default function HeroSection() {
  const floatingElements = [
    { x: 20, y: 20, delay: 0 },
    { x: -15, y: 15, delay: 0.5 },
    { x: 25, y: -10, delay: 1 },
    { x: -20, y: -15, delay: 1.5 }
  ]

  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.8,
        ease: [0.6, 0.05, 0.01, 0.9]
      }
    })
  }

  const title = "Protect Your Digital Privacy".split("")
  return (
    <div className="relative bg-gradient-theme overflow-hidden">
      {/* Animated Background Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute w-32 h-32 rounded-full bg-theme-primary/10 blur-xl"
          animate={{
            x: [element.x, element.x + 20, element.x],
            y: [element.y, element.y - 15, element.y],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + index * 20}%`,
            top: `${30 + index * 15}%`
          }}
        />
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">        <div className="text-center">
          {/* Animated Title */}
          <div className="text-4xl md:text-6xl font-bold text-theme-text mb-6 overflow-hidden">
            {title.map((letter, index) => (
              <motion.span
                key={index}
                custom={index}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className={`inline-block ${letter === " " ? "w-4" : ""} ${
                  index >= 13 && index <= 19 ? "text-theme-primary" : ""
                }`}
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-lg md:text-xl text-theme-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Securo provides comprehensive tools to monitor your digital footprint, 
            enhance online security, and protect your sensitive information.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >              <Button
                size="lg" 
                className="relative text-lg px-8 py-3 btn-primary shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                <span className="relative z-10">Get Started Free</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="relative text-lg px-8 py-3 btn-outline-primary transition-all duration-300 group overflow-hidden"
              >
                <span className="relative z-10">Learn More</span>
                <motion.div
                  className="absolute inset-0 bg-theme-primary"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0.5, originY: 0.5 }}
                />
              </Button>
            </motion.div>
          </motion.div>          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { number: "10K+", label: "Protected Users" },
              { number: "50M+", label: "Breaches Monitored" },
              { number: "99.9%", label: "Uptime" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 rounded-lg card-theme backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-theme-primary">{stat.number}</div>
                <div className="text-sm text-theme-text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
