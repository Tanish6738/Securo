"use client";

import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Security", href: "/security" },
      { name: "API Documentation", href: "/docs" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR Compliance", href: "/gdpr" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Community Forum", href: "/forum" },
      { name: "System Status", href: "/status" },
      { name: "Report Vulnerability", href: "/security-report" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", href: "#", icon: "𝕏" },
    { name: "LinkedIn", href: "#", icon: "in" },
    { name: "GitHub", href: "#", icon: "⚡" },
  ];
  return (
    <footer className="bg-theme-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center mb-6">
              <ShieldCheckIcon className="h-8 w-8 text-theme-primary mr-3" />
              <span className="text-2xl font-bold text-theme-text">
                Securo
              </span>
            </div>
            <p className="text-theme-text-secondary mb-6 leading-relaxed">
              Protecting your digital privacy with comprehensive monitoring,
              secure tools, and real-time threat intelligence. Your privacy is
              our priority.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-theme-text-secondary">
                <EnvelopeIcon className="h-5 w-5 mr-3 text-theme-primary" />
                <span>support@securo.com</span>
              </div>
              <div className="flex items-center text-theme-text-secondary">
                <PhoneIcon className="h-5 w-5 mr-3 text-theme-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-theme-text-secondary">
                <MapPinIcon className="h-5 w-5 mr-3 text-theme-primary" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </motion.div>
          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group"
          >
            {" "}
            <h3 className="text-theme-text font-semibold mb-6 relative">
              Product
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-theme-primary to-transparent"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </h3>            <ul className="space-y-4">
              {footerLinks.product.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  <motion.a
                    href={link.href}
                    className="text-theme-text-secondary hover:text-theme-primary transition-all duration-200 flex items-center group"
                    whileHover={{ x: 5 }}
                  >
                    <motion.span
                      className="w-1 h-1 bg-theme-primary rounded-full mr-3 opacity-0 group-hover:opacity-100"
                      initial={false}
                      animate={{ scale: [0, 1] }}
                      transition={{ duration: 0.2 }}
                    />
                    {link.name}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>{" "}
          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group"
          >
            <h3 className="text-theme-text font-semibold mb-6 relative">
              Company
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-theme-primary to-transparent"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </h3>            <ul className="space-y-4">
              {footerLinks.company.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                >
                  <motion.a
                    href={link.href}
                    className="text-theme-text-secondary hover:text-theme-primary transition-all duration-200 flex items-center group"
                    whileHover={{ x: 5 }}
                  >
                    <motion.span
                      className="w-1 h-1 bg-theme-primary rounded-full mr-3 opacity-0 group-hover:opacity-100"
                      initial={false}
                      animate={{ scale: [0, 1] }}
                      transition={{ duration: 0.2 }}
                    />
                    {link.name}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group"
          >            <h3 className="text-theme-text font-semibold mb-6 relative">
              Legal
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-theme-primary to-transparent"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </h3>            <ul className="space-y-4">
              {footerLinks.legal.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                >
                  <motion.a
                    href={link.href}
                    className="text-theme-text-secondary hover:text-theme-primary transition-all duration-200 flex items-center group"
                    whileHover={{ x: 5 }}
                  >
                    <motion.span
                      className="w-1 h-1 bg-theme-primary rounded-full mr-3 opacity-0 group-hover:opacity-100"
                      initial={false}
                      animate={{ scale: [0, 1] }}
                      transition={{ duration: 0.2 }}
                    />
                    {link.name}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group"
          >            <h3 className="text-theme-text font-semibold mb-6 relative">
              Support
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-theme-primary to-transparent"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
            </h3>
            <ul className="space-y-4">
              {footerLinks.support.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <motion.a
                    href={link.href}
                    className="text-theme-text-secondary hover:text-theme-primary transition-all duration-200 flex items-center group"
                    whileHover={{ x: 5 }}
                  >
                    <motion.span
                      className="w-1 h-1 bg-theme-primary rounded-full mr-3 opacity-0 group-hover:opacity-100"
                      initial={false}
                      animate={{ scale: [0, 1] }}
                      transition={{ duration: 0.2 }}
                    />
                    {link.name}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="border-t border-theme-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="text-theme-text-secondary text-sm mb-4 md:mb-0">
            © 2024 Securo. All rights reserved. | Protecting privacy
            since 2024.
          </div>
          <div className="flex space-x-6">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-theme-text-secondary hover:text-theme-primary transition-colors duration-200"
                aria-label={social.name}
              >
                <span className="text-xl">{social.icon}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center bg-theme-secondary rounded-lg px-4 py-2">
            <ShieldCheckIcon className="h-5 w-5 text-theme-success mr-2" />
            <span className="text-sm text-theme-text-secondary">
              SOC 2 Compliant • ISO 27001 Certified • GDPR Ready
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
