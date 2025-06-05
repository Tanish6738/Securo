'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "How does PrivacyGuard protect my data?",
      answer: "PrivacyGuard uses industry-standard encryption and secure APIs to check your data against breach databases. We never store your passwords or personal information on our servers. All checks are performed securely and anonymously."
    },
    {
      question: "Is the temporary email service really secure?",
      answer: "Yes! Our temporary email service uses Mail.tm's secure infrastructure. These emails are designed to be disposable and help protect your primary email from spam, tracking, and unwanted communications."
    },
    {
      question: "How often is the breach database updated?",
      answer: "Our breach database is updated in real-time through our partnership with leading security APIs. We monitor new breaches continuously and alert users as soon as their data appears in any new incidents."
    },
    {
      question: "Can I use PrivacyGuard for my business?",
      answer: "Absolutely! Our Business plan is designed for teams and organizations. It includes advanced monitoring for multiple email addresses, team management tools, and dedicated support for enterprise security needs."
    },
    {
      question: "What happens to my data if I cancel my subscription?",
      answer: "You maintain access to your account and data during your billing period. After cancellation, you can still access basic features. We follow strict data retention policies and will securely delete your data upon request."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Currently, PrivacyGuard is optimized as a responsive web application that works great on mobile devices. We're working on dedicated mobile apps that will be available soon."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  }  
  return (
    <div id="faq" className="relative py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-32 left-16 w-24 h-24 rounded-full bg-blue-200/10 dark:bg-blue-800/10 blur-xl" />
        <div className="absolute bottom-32 right-16 w-32 h-32 rounded-full bg-indigo-200/10 dark:bg-indigo-800/10 blur-xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get answers to common questions about PrivacyGuard.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-6"
        >
          {faqs.map((faq, index) => (              <motion.div
                key={index}
                variants={itemVariants}
                className="group bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/50 dark:border-gray-600/50"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 relative overflow-hidden"
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Hover effect background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <span className="relative text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {faq.question}
                  </span>
                  
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {openIndex === index ? (
                        <ChevronUpIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <ChevronDownIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                      )}
                    </motion.div>
                  </motion.div>
                </motion.button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    opacity: { duration: 0.3 }
                  }}
                  className="overflow-hidden"
                >
                  <motion.div 
                    className="px-8 pb-6"
                    initial={{ y: -10 }}
                    animate={{ y: openIndex === index ? 0 : -10 }}
                    transition={{ duration: 0.3, delay: openIndex === index ? 0.1 : 0 }}
                  >
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                      {faq.answer}
                    </p>
                  </motion.div>
                </motion.div>

                {/* Animated border on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-blue-400 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}