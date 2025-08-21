import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Anchor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ContactInfo } from '../types';

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ContactInfo>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    alert(t('contact.form.success', 'Thank you for your message! We will contact you soon.'));
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('contact.info.title')}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-ocean-600 mr-4" />
                  <div>
                    <p className="font-medium text-gray-900">{t('contact.info.phone')}</p>
                    <a href="tel:+33123456789" className="text-ocean-600 hover:text-ocean-700">
                      +33 1 23 45 67 89
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-ocean-600 mr-4" />
                  <div>
                    <p className="font-medium text-gray-900">{t('contact.info.email')}</p>
                    <a href="mailto:contact@cortosailing.fr" className="text-ocean-600 hover:text-ocean-700">
                      contact@cortosailing.fr
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-ocean-600 mr-4" />
                  <div>
                    <p className="font-medium text-gray-900">{t('contact.info.location')}</p>
                    <p className="text-gray-600">Port d'Agde, 34300 Agde</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boat Info */}
            <div className="bg-ocean-50 rounded-xl p-6 border border-ocean-200">
              <div className="flex items-center mb-4">
                <Anchor className="h-6 w-6 text-ocean-600 mr-3" />
                <h4 className="text-lg font-bold text-ocean-800">{t('contact.boat.title')}</h4>
              </div>
              <div className="space-y-2 text-sm text-ocean-700">
                <p>{t('contact.boat.type')}</p>
                <p>{t('contact.boat.capacity')}</p>
                <p>{t('contact.boat.base')}</p>
                <p>{t('contact.boat.zone')}</p>
              </div>
            </div>

            {/* Social proof */}
            <div className="bg-sunset-50 rounded-xl p-6 border border-sunset-200">
              <h4 className="text-lg font-bold text-sunset-800 mb-3">
                {t('contact.why.title')}
              </h4>
              <ul className="space-y-2 text-sm text-sunset-700">
                {(t('contact.why.reasons', { returnObjects: true }) as string[]).map((reason: string, idx: number) => (
                  <li key={idx}>• {reason}</li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('contact.form.title')}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                    placeholder={t('contact.form.namePlaceholder')}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                    placeholder={t('contact.form.phonePlaceholder')}
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                    placeholder={t('contact.form.messagePlaceholder')}
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  {t('contact.form.submit')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
