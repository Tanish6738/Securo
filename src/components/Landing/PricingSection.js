'use client'

import { motion } from 'framer-motion'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { CheckIcon } from '@heroicons/react/24/outline'

export default function PricingSection() {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Essential privacy tools to get you started.",
      features: [
        "Basic Breach Monitoring (1 Email)",
        "Password Security Check",
        "Temporary Email (Limited Use)",
        "Privacy News Access"
      ],
      buttonText: "Get Started",
      highlight: false
    },
    {
      name: "Pro",
      price: "$9.99",
      pricePeriod: "/month",
      description: "Comprehensive protection for proactive users.",
      features: [
        "Advanced Breach Monitoring (5 Emails)",
        "Full Password Security Insights",
        "Unlimited Temporary Emails",
        "Fake Data Generator",
        "Digital Footprint Analysis",
        "Priority Support"
      ],
      buttonText: "Choose Pro",
      highlight: true
    },
    {
      name: "Business",
      price: "$29.99",
      pricePeriod: "/month",
      description: "Robust security for teams and organizations.",
      features: [
        "Team Breach Monitoring (20 Emails)",
        "All Pro Features",
        "Team Management Tools",
        "Custom Security Reports",
        "Dedicated Account Manager"
      ],
      buttonText: "Contact Sales",
      highlight: false
    }
  ]
  let i = 0
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
      rotateY: -15
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: i === 1 ? 1.05 : 1, // Highlight middle card
      rotateY: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }),
    hover: {
      y: -15,
      scale: i === 1 ? 1.08 : 1.03,
      rotateY: 2,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4
      }
    })
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  }
  return (
    <div id="pricing" className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Flexible Pricing for Everyone
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the plan that best fits your privacy needs.
          </p>
        </motion.div>        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch perspective-1000">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.2 }}
              className="flex group"
            >
              <Card 
                className={`relative w-full flex flex-col rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden
                            ${plan.highlight 
                              ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-400' 
                              : 'bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700'
                            } backdrop-blur-sm`}
              >
                {/* Animated background */}
                {plan.highlight && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />
                )}

                {/* Popular badge */}
                {plan.highlight && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg"
                  >
                    Most Popular
                  </motion.div>
                )}

                <CardHeader className="relative p-8 text-center">
                  <CardTitle className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                    {plan.name}
                  </CardTitle>
                  
                  <motion.div 
                    className="my-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={`text-5xl font-extrabold ${plan.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                      {plan.price}
                    </span>
                    {plan.pricePeriod && (
                      <span className="text-gray-500 dark:text-gray-400 text-lg">
                        {plan.pricePeriod}
                      </span>
                    )}
                  </motion.div>
                  
                  <CardDescription className={`text-lg ${plan.highlight ? 'text-blue-600 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}>
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative p-8 flex-grow">
                  <ul className="space-y-4">
                    {plan.features.map((feature, fIndex) => (
                      <motion.li 
                        key={fIndex} 
                        custom={fIndex}
                        variants={featureVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="flex items-start group/feature"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CheckIcon className={`flex-shrink-0 h-6 w-6 mr-3 mt-0.5 ${plan.highlight ? 'text-blue-500' : 'text-green-500'}`} />
                        </motion.div>
                        <span className={`text-sm leading-relaxed ${plan.highlight ? 'text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300'} group-hover/feature:text-gray-900 dark:group-hover/feature:text-white transition-colors duration-200`}>
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>

                <div className="relative p-8 mt-auto">
                  <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button 
                      size="lg" 
                      className={`relative w-full text-lg font-semibold overflow-hidden ${
                        plan.highlight 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg' 
                          : 'bg-gray-800 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-white'
                      } transition-all duration-300`}
                    >
                      <span className="relative z-10">{plan.buttonText}</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </Button>
                  </motion.div>
                </div>

                {/* Animated border glow */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl ${plan.highlight ? 'border-2 border-blue-400' : 'border border-gray-300'} opacity-0`}
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
