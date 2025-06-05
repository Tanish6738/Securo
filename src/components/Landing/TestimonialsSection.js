'use client'

import { motion } from 'framer-motion'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StarIcon } from '@heroicons/react/24/solid'

export default function TestimonialsSection() {  const testimonials = [
    {
      name: "Alex P.",
      role: "Cybersecurity Analyst",
      quote: "PrivacyGuard has become an indispensable tool for my clients. The breach monitoring is top-notch and the temporary email feature is a lifesaver!",
      avatar: "/avatars/alex.png", // Placeholder path
      rating: 5
    },
    {
      name: "Sarah L.",
      role: "Freelance Developer",
      quote: "I love the fake data generator for testing my apps. Plus, staying updated with privacy news all in one place is incredibly convenient.",
      avatar: "/avatars/sarah.png", // Placeholder path
      rating: 5
    },
    {
      name: "Mike B.",
      role: "Small Business Owner",
      quote: "Understanding my digital footprint was eye-opening. PrivacyGuard gave me the tools to take control and protect my business data.",
      avatar: "/avatars/mike.png", // Placeholder path
      rating: 5
    }
  ]
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      rotateX: -30
    },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }),
    hover: {
      y: -10,
      scale: 1.02,
      rotateY: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  const quoteVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5,
        duration: 0.6
      }
    }
  }

  const starVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: (i) => ({
      scale: 1,
      rotate: 0,
      transition: {
        delay: i * 0.1 + 0.8,
        duration: 0.4,
        ease: "backOut"
      }
    })
  }

  return (
    <div id="testimonials" className="relative py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-blue-200/20 dark:bg-blue-800/20 blur-2xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-indigo-200/20 dark:bg-indigo-800/20 blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Professionals
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hear what our users say about PrivacyGuard.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.2 }}
              className="group"
            >
              <Card className="relative h-full flex flex-col bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden">
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />                {/* Quote decoration */}
                <div className="absolute top-4 left-4 text-6xl text-blue-200 dark:text-blue-800 font-serif">&ldquo;</div>

                <CardHeader className="relative flex items-center space-x-4 p-8 pb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {testimonial.name.substring(0,1)}
                    </div>
                  </motion.div>
                  
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {testimonial.name}
                    </CardTitle>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {testimonial.role}
                    </p>
                    
                    {/* Star rating */}
                    <div className="flex mt-2 space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          custom={i}
                          variants={starVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                        >
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative flex-grow p-8 pt-4">
                  <motion.div
                    variants={quoteVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg italic relative z-10">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                  </motion.div>
                </CardContent>

                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-blue-400 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-8 w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20"
        />
        
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-12 w-6 h-6 bg-indigo-200 dark:bg-indigo-800 rounded-full opacity-20"
        />
      </div>
    </div>
  )
}
