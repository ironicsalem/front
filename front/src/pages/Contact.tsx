import React, { useState } from 'react'
import Footer from '../components/Footer'

const Contact: React.FC = () => {
  // State for contact form
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  // State for guide application form
  const [guideForm, setGuideForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    languages: '',
    experience: '',
    motivation: '',
    resume: null as File | null
  })

  // State for active tab
  const [activeTab, setActiveTab] = useState('contact')

  // Handle contact form changes
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle guide form changes
  const handleGuideChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setGuideForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGuideForm(prev => ({
        ...prev,
        resume: e.target.files ? e.target.files[0] : null
      }))
    }
  }

  // Handle contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form submitted:', contactForm)
    // Here you would typically send the form data to your backend
    alert('Thank you for contacting us! We will get back to you soon.')
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
  }

  // Handle guide application submission
  const handleGuideSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Guide application submitted:', guideForm)
    // Here you would typically send the form data to your backend
    alert('Thank you for your interest in becoming a guide! We will review your application and contact you soon.')
    setGuideForm({
      fullName: '',
      email: '',
      phone: '',
      city: '',
      languages: '',
      experience: '',
      motivation: '',
      resume: null
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page header with background image */}
      <div className="relative h-64 bg-blue-700">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/images/petra-treasury.jpg)',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">Contact Us</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Contact Information Section */}
          <section className="mb-12">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Map or Image */}
                <div className="bg-gray-300 h-64 md:h-auto col-span-1">
                  {/* Placeholder for a map */}
                  <div className="h-full w-full flex items-center justify-center bg-blue-100">
                    <p className="text-gray-500">Map View</p>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="col-span-2 p-8">
                  <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-start mb-4">
                        <svg className="h-6 w-6 text-blue-600 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <h3 className="font-semibold text-gray-800">Address</h3>
                          <p className="text-gray-600">123 Tourism Street, Amman, Jordan</p>
                        </div>
                      </div>
                      <div className="flex items-start mb-4">
                        <svg className="h-6 w-6 text-blue-600 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <h3 className="font-semibold text-gray-800">Email</h3>
                          <p className="text-gray-600">info@wonderfuljordan.com</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-start mb-4">
                        <svg className="h-6 w-6 text-blue-600 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <h3 className="font-semibold text-gray-800">Phone</h3>
                          <p className="text-gray-600">+962 6 123 4567</p>
                        </div>
                      </div>
                      <div className="flex items-start mb-4">
                        <svg className="h-6 w-6 text-blue-600 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h3 className="font-semibold text-gray-800">Working Hours</h3>
                          <p className="text-gray-600">Mon-Fri: 9AM - 5PM</p>
                          <p className="text-gray-600">Sat: 10AM - 2PM</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Follow Us</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                        </svg>
                      </a>
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.44,4.83c-0.8,0.37-1.66,0.61-2.58,0.73c0.93-0.56,1.64-1.43,1.98-2.49c-0.87,0.52-1.83,0.89-2.85,1.09 C19.13,3.07,17.95,2.5,16.67,2.5c-2.89,0-5.19,2.41-5.19,5.38c0,0.42,0.04,0.83,0.13,1.23C7.42,8.9,4.08,6.79,1.66,3.74 C1.24,4.54,1,5.45,1,6.41c0,1.87,0.93,3.52,2.33,4.45C2.55,10.85,1.8,10.63,1.15,10.28v0.07c0,2.61,1.81,4.78,4.19,5.27 c-0.44,0.12-0.9,0.19-1.37,0.19c-0.34,0-0.66-0.03-0.98-0.1c0.67,2.14,2.61,3.69,4.91,3.74c-1.8,1.44-4.07,2.3-6.53,2.3 c-0.42,0-0.84-0.02-1.26-0.07c2.33,1.52,5.09,2.41,8.06,2.41c9.67,0,14.97-8.15,14.97-15.23c0-0.23,0-0.46-0.01-0.69 C22.06,6.57,22.83,5.75,23.44,4.83z"/>
                        </svg>
                      </a>
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2.163c3.204,0,3.584,0.012,4.85,0.07c3.252,0.148,4.771,1.691,4.919,4.919c0.058,1.265,0.069,1.645,0.069,4.849c0,3.205-0.012,3.584-0.069,4.849c-0.149,3.225-1.664,4.771-4.919,4.919c-1.266,0.058-1.644,0.07-4.85,0.07c-3.204,0-3.584-0.012-4.849-0.07c-3.26-0.149-4.771-1.699-4.919-4.92c-0.058-1.265-0.07-1.644-0.07-4.849c0-3.204,0.013-3.583,0.07-4.849C2.381,3.924,3.896,2.38,7.151,2.232C8.417,2.175,8.796,2.163,12,2.163 M12,0C8.741,0,8.333,0.014,7.053,0.072c-4.358,0.2-6.78,2.618-6.98,6.98C0.014,8.333,0,8.741,0,12s0.014,3.668,0.072,4.948c0.2,4.358,2.618,6.78,6.98,6.98C8.333,23.986,8.741,24,12,24s3.668-0.014,4.948-0.072c4.354-0.2,6.782-2.618,6.979-6.98C23.986,15.668,24,15.259,24,12s-0.014-3.667-0.072-4.947c-0.196-4.354-2.617-6.78-6.979-6.98C15.668,0.014,15.259,0,12,0 M12,5.838c-3.403,0-6.162,2.759-6.162,6.162c0,3.403,2.759,6.162,6.162,6.162c3.403,0,6.162-2.759,6.162-6.162C18.162,8.597,15.403,5.838,12,5.838 M12,16c-2.209,0-4-1.791-4-4c0-2.209,1.791-4,4-4s4,1.791,4,4C16,14.209,14.209,16,12,16 M18.406,4.155c-0.796,0-1.441,0.645-1.441,1.44s0.645,1.44,1.441,1.44c0.795,0,1.439-0.645,1.439-1.44S19.201,4.155,18.406,4.155"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs for Contact & Become a Guide */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'contact'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Contact Us
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'guide'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Become a Guide
                </button>
              </nav>
            </div>
          </div>

          {/* Contact Form Section */}
          {activeTab === 'contact' && (
            <section className="mb-16">
              <div className="bg-white shadow-lg rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={contactForm.name}
                        onChange={handleContactChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Your Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleContactChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={contactForm.message}
                      onChange={handleContactChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* Become a Guide Section */}
          {activeTab === 'guide' && (
            <section className="mb-16">
              <div className="bg-white shadow-lg rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Apply to Become a Guide</h2>
                <p className="text-gray-600 mb-6">
                  Join our team of professional guides and share your knowledge and passion for Jordan with visitors from around the world.
                  We're looking for experienced individuals with excellent communication skills and deep knowledge of Jordan's history,
                  culture, and attractions.
                </p>
                
                <form onSubmit={handleGuideSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={guideForm.fullName}
                        onChange={handleGuideChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={guideForm.email}
                        onChange={handleGuideChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={guideForm.phone}
                        onChange={handleGuideChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-gray-700 font-medium mb-2">City of Residence</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={guideForm.city}
                        onChange={handleGuideChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="languages" className="block text-gray-700 font-medium mb-2">Languages Spoken</label>
                    <input
                      type="text"
                      id="languages"
                      name="languages"
                      value={guideForm.languages}
                      onChange={handleGuideChange}
                      placeholder="e.g., English, Arabic, French"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="experience" className="block text-gray-700 font-medium mb-2">Previous Tour Guide Experience</label>
                    <textarea
                      id="experience"
                      name="experience"
                      rows={3}
                      value={guideForm.experience}
                      onChange={handleGuideChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="motivation" className="block text-gray-700 font-medium mb-2">Why do you want to join our team?</label>
                    <textarea
                      id="motivation"
                      name="motivation"
                      rows={3}
                      value={guideForm.motivation}
                      onChange={handleGuideChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="resume" className="block text-gray-700 font-medium mb-2">Upload Resume/CV</label>
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept=".pdf,.doc,.docx"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX. Max size: 5MB</p>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800">What are your operating hours?</h3>
                  <p className="mt-2 text-gray-600">Our office in Amman is open Monday to Friday from 9AM to 5PM, and Saturday from 10AM to 2PM. Our guides are available for tours 7 days a week.</p>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800">How far in advance should I book a tour?</h3>
                  <p className="mt-2 text-gray-600">We recommend booking at least 2-4 weeks in advance, especially during the high season (March-May and September-November). For custom tours, more advance notice is helpful.</p>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800">Do you offer pick-up from hotels?</h3>
                  <p className="mt-2 text-gray-600">Yes, most of our tours include hotel pick-up and drop-off in Amman, Petra, and other major tourist areas at no additional cost.</p>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800">What languages do your guides speak?</h3>
                  <p className="mt-2 text-gray-600">Our guides are fluent in Arabic and English. We also have guides who speak French, Spanish, German, Italian, Russian, and Japanese. Please specify your language preference when booking.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Contact