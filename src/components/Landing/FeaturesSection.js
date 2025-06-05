'use client'

import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon, 
  KeyIcon, 
  DocumentDuplicateIcon,
  EnvelopeIcon,
  NewspaperIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function FeaturesSection() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Breach Monitoring",
      description: "Monitor your email addresses against known data breaches in real-time."
    },
    {
      icon: KeyIcon,
      title: "Password Security",
      description: "Check if your passwords have been compromised in security breaches."
    },
    {
      icon: DocumentDuplicateIcon,
      title: "Fake Data Generator",
      description: "Generate realistic fake data for testing and privacy protection."
    },
    {
      icon: EnvelopeIcon,
      title: "Temporary Email",
      description: "Create disposable email addresses to protect your primary inbox."
    },
    {
      icon: NewspaperIcon,
      title: "Privacy News",
      description: "Stay updated with the latest cybersecurity and privacy news."
    },
    {
      icon: EyeIcon,
      title: "Digital Footprint",
      description: "Monitor and manage your online presence and data exposure."
    }
  ]
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
      rotateX: -15
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }),
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.1, 
      rotate: 5,
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  }

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: { x: "100%" }
  }
  return (
    <div id="features" className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Comprehensive Privacy Protection
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to secure your digital life in one powerful dashboard.
          </p>
        </motion.div>        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.3 }}
              className="group"
            >
              <Card className="relative h-full hover:shadow-2xl transition-all duration-500 ease-out bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  variants={shimmerVariants}
                  initial="initial"
                  whileHover="animate"
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                
                <CardHeader className="relative">
                  <motion.div
                    variants={iconVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                    <feature.icon className="relative h-12 w-12 text-blue-600 dark:text-blue-400 mb-4 group-hover:text-blue-500 transition-colors duration-300" />
                  </motion.div>
                  
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-blue-400 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
