import React, { useState, useEffect, useRef } from 'react';

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to Quick Tech Rent support. I'm here to help you with any questions about laptop rentals. How can I assist you today?",
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [animatedCards, setAnimatedCards] = useState([]);
  const chatContainerRef = useRef(null);

  const faqCategories = [
    {
      title: "Rental Process",
      icon: "fas fa-shopping-cart",
      questions: [
        {
          question: "How long can I rent a laptop for?",
          answer: "You can rent laptops for a minimum of 1 day and a maximum of 30 days. For longer rental periods, please contact our support team for custom arrangements."
        },
        {
          question: "What's the minimum rental period?",
          answer: "The minimum rental period is 1 day. We offer flexible options to suit your needs, whether it's for a short project or extended use."
        },
        {
          question: "Can I extend my rental period?",
          answer: "Yes! You can extend your rental period as long as the laptop hasn't been booked by another customer. Extensions can be requested through your dashboard or by contacting support."
        }
      ]
    },
    {
      title: "Delivery & Return",
      icon: "fas fa-shipping-fast",
      questions: [
        {
          question: "How fast is delivery?",
          answer: "We offer same-day delivery for orders placed before 2 PM in most metropolitan areas. Standard delivery is next business day. Delivery times may vary based on your location."
        },
        {
          question: "What are your delivery areas?",
          answer: "We currently deliver to major cities across India. During checkout, you can enter your address to check availability in your area."
        },
        {
          question: "How do I return the laptop?",
          answer: "We provide a prepaid return shipping label. Simply pack the laptop in the original packaging, attach the label, and schedule a pickup or drop it at any authorized shipping location."
        }
      ]
    },
    {
      title: "Pricing & Payments",
      icon: "fas fa-credit-card",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and cash on delivery in select areas. Online payment options are secure and encrypted."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No hidden fees! The price you see is what you pay. This includes delivery, basic insurance, and standard support. Additional services like premium support or extra insurance are clearly listed as optional."
        },
        {
          question: "Do you offer discounts for long-term rentals?",
          answer: "Yes! We offer discounted rates for rentals longer than 7 days. Contact our sales team for custom quotes on extended rental periods."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: "fas fa-tools",
      questions: [
        {
          question: "What if the laptop has technical issues?",
          answer: "We thoroughly test all laptops before shipping. If you encounter any issues, contact our 24/7 support team immediately. We'll troubleshoot remotely or arrange a replacement if needed."
        },
        {
          question: "Do you provide technical setup assistance?",
          answer: "Yes! Our support team can assist with basic setup and configuration. We also provide setup guides for all our laptop models."
        },
        {
          question: "What software is included?",
          answer: "All laptops come with Windows 11/macOS pre-installed, plus essential software like Microsoft Office, antivirus protection, and productivity tools. Specific software requirements can be arranged upon request."
        }
      ]
    }
  ];

  useEffect(() => {
    // Animate cards on load
    const timer = setTimeout(() => {
      setAnimatedCards([0, 1, 2]);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! Our support team will get back to you within 24 hours.');
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMessage = {
        id: chatMessages.length + 1,
        text: newMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      setChatMessages([...chatMessages, userMessage]);
      setNewMessage('');

      // Simulate auto-reply
      setTimeout(() => {
        const responses = [
          "I understand. Let me check that for you.",
          "Thanks for sharing that information. Our team can help with that.",
          "I'll connect you with a specialist who can assist further.",
          "That's a great question! Let me provide you with the details."
        ];
        
        const autoReply = {
          id: chatMessages.length + 2,
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'support',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, autoReply]);
      }, 1500);
    }
  };

  const startChat = () => {
    setShowChat(true);
  };

  // Inline styles for animations
  const supportCardStyle = {
    transition: 'all 0.3s ease'
  };

  const resourceCardStyle = {
    transition: 'all 0.3s ease'
  };

  const contactItemStyle = {
    transition: 'all 0.3s ease'
  };

  const tabContentStyle = {
    animation: 'fadeIn 0.5s ease-in'
  };

  const messageTextStyle = {
    lineHeight: '1.5'
  };

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="row">
        <div className="col-md-12">
          <div className="text-center mb-5">
            <h1 className="display-6 fw-semibold text-dark mb-3">Support Center</h1>
            <p className="lead text-muted">We're here to help you 24/7 with any questions or issues</p>
          </div>
        </div>
      </div>

      {/* Quick Help Cards with Animation */}
      <div className="row mb-5">
        {[
          {
            icon: "fas fa-headset",
            title: "24/7 Live Chat",
            desc: "Get instant help from our support team",
            buttonText: "Start Chat",
            color: "primary",
            action: startChat
          },
          {
            icon: "fas fa-phone",
            title: "Phone Support",
            desc: "Speak directly with our experts",
            buttonText: "Call Now",
            color: "success",
            action: () => window.open('tel:+919769602148')
          },
          {
            icon: "fas fa-envelope",
            title: "Email Support",
            desc: "Get detailed responses within hours",
            buttonText: "Email Us",
            color: "info",
            action: () => window.open('mailto:quicktechrent@gmail.com')
          }
        ].map((card, index) => (
          <div key={index} className="col-md-4 mb-4">
            <div 
              className={`card text-center h-100 border-${card.color} shadow-sm support-card ${
                animatedCards.includes(index) ? 'animate-in' : ''
              }`}
              style={{
                transition: 'all 0.5s ease',
                transform: animatedCards.includes(index) ? 'translateY(0)' : 'translateY(50px)',
                opacity: animatedCards.includes(index) ? 1 : 0,
                ...supportCardStyle
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = animatedCards.includes(index) ? 'translateY(0)' : 'translateY(50px)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div className="card-body p-4">
                <div className={`text-${card.color} mb-3`}>
                  <i className={`${card.icon} fa-3x`}></i>
                </div>
                <h5 className="card-title fw-semibold">{card.title}</h5>
                <p className="card-text text-muted">{card.desc}</p>
                <button 
                  className={`btn btn-${card.color} px-4`}
                  onClick={card.action}
                >
                  {card.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 py-3">
              <ul className="nav nav-pills nav-fill">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`}
                    onClick={() => setActiveTab('faq')}
                  >
                    <i className="fas fa-question-circle me-2"></i>
                    FAQs
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
                    onClick={() => setActiveTab('contact')}
                  >
                    <i className="fas fa-envelope me-2"></i>
                    Contact Form
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'resources' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resources')}
                  >
                    <i className="fas fa-book me-2"></i>
                    Resources
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-4">
              {/* FAQ Tab */}
              {activeTab === 'faq' && (
                <div style={tabContentStyle}>
                  <h3 className="mb-4 text-dark">Frequently Asked Questions</h3>
                  {faqCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-4">
                      <div className="d-flex align-items-center mb-3">
                        <i className={`${category.icon} text-primary me-3 fa-lg`}></i>
                        <h4 className="text-primary mb-0">{category.title}</h4>
                      </div>
                      <div className="accordion" id={`accordion${categoryIndex}`}>
                        {category.questions.map((faq, faqIndex) => (
                          <div key={faqIndex} className="accordion-item border-0 mb-2">
                            <h2 className="accordion-header">
                              <button
                                className="accordion-button collapsed bg-light text-dark fw-semibold"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapse${categoryIndex}${faqIndex}`}
                                style={{borderRadius: '8px'}}
                              >
                                <i className="fas fa-question-circle text-primary me-2"></i>
                                {faq.question}
                              </button>
                            </h2>
                            <div
                              id={`collapse${categoryIndex}${faqIndex}`}
                              className="accordion-collapse collapse"
                              data-bs-parent={`#accordion${categoryIndex}`}
                            >
                              <div className="accordion-body bg-white text-muted">
                                <i className="fas fa-info-circle text-success me-2"></i>
                                {faq.answer}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact Form Tab */}
              {activeTab === 'contact' && (
                <div style={tabContentStyle}>
                  <div className="row justify-content-center">
                    <div className="col-lg-8">
                      <div className="text-center mb-4">
                        <h3 className="text-dark">Contact Our Support Team</h3>
                        <p className="text-muted">We'll get back to you within 24 hours</p>
                      </div>
                      <form onSubmit={handleContactSubmit}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-semibold">Full Name *</label>
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              name="name"
                              value={contactForm.name}
                              onChange={handleContactChange}
                              required
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-semibold">Email *</label>
                            <input
                              type="email"
                              className="form-control form-control-lg"
                              name="email"
                              value={contactForm.email}
                              onChange={handleContactChange}
                              required
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Subject *</label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            name="subject"
                            value={contactForm.subject}
                            onChange={handleContactChange}
                            required
                            placeholder="Brief subject of your inquiry"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="form-label fw-semibold">Message *</label>
                          <textarea
                            className="form-control"
                            name="message"
                            rows="5"
                            value={contactForm.message}
                            onChange={handleContactChange}
                            placeholder="Please describe your issue or question in detail..."
                            required
                            style={{resize: 'none'}}
                          ></textarea>
                        </div>
                        <div className="text-center">
                          <button type="submit" className="btn btn-primary btn-lg px-5">
                            <i className="fas fa-paper-plane me-2"></i>
                            Send Message
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <div style={tabContentStyle}>
                  <h3 className="mb-4 text-dark">Helpful Resources</h3>
                  <div className="row">
                    {[
                      {
                        icon: "fas fa-download",
                        title: "Setup Guides",
                        desc: "Step-by-step guides for setting up your rented laptop and software.",
                        color: "primary",
                        buttons: ["Windows Guide", "macOS Guide", "Software Setup"]
                      },
                      {
                        icon: "fas fa-video",
                        title: "Video Tutorials",
                        desc: "Watch video tutorials for common tasks and troubleshooting.",
                        color: "success",
                        buttons: ["Getting Started", "Troubleshooting", "Advanced Features"]
                      },
                      {
                        icon: "fas fa-file-alt",
                        title: "Documentation",
                        desc: "Comprehensive documentation for all our services and policies.",
                        color: "info",
                        buttons: ["Rental Policy", "Terms of Service", "Privacy Policy"]
                      },
                      {
                        icon: "fas fa-tools",
                        title: "Troubleshooting",
                        desc: "Common issues and their solutions for quick problem resolution.",
                        color: "warning",
                        buttons: ["WiFi Issues", "Performance", "Software Problems"]
                      }
                    ].map((resource, index) => (
                      <div key={index} className="col-md-6 mb-4">
                        <div 
                          className="card h-100 border-0 shadow-sm resource-card"
                          style={resourceCardStyle}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '';
                          }}
                        >
                          <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                              <i className={`${resource.icon} text-${resource.color} fa-2x me-3`}></i>
                              <h5 className="card-title mb-0 fw-semibold">{resource.title}</h5>
                            </div>
                            <p className="card-text text-muted mb-3">{resource.desc}</p>
                            <div className="d-flex flex-wrap gap-2">
                              {resource.buttons.map((btn, btnIndex) => (
                                <button 
                                  key={btnIndex}
                                  className={`btn btn-outline-${resource.color} btn-sm`}
                                >
                                  {btn}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information - Updated to White Box */}
      <div className="row mt-5">
        <div className="col-md-12">
          <div className="card bg-white border shadow-sm">
            <div className="card-body p-5">
              <h4 className="mb-4 text-center text-dark">Other Ways to Reach Us</h4>
              <div className="row">
                {[
                  {
                    icon: "fas fa-envelope text-primary",
                    title: "Email",
                    detail: "quicktechrent@gmail.com",
                    subtext: "Response within 2 hours"
                  },
                  {
                    icon: "fas fa-phone text-success",
                    title: "Phone",
                    detail: "+91 9769602148",
                    subtext: "24/7 available"
                  },
                  {
                    icon: "fas fa-clock text-info",
                    title: "Business Hours",
                    detail: "Mon-Fri: 9AM-6PM IST",
                    subtext: "Sat: 10AM-4PM IST"
                  },
                  {
                    icon: "fas fa-map-marker-alt text-warning",
                    title: "Address",
                    detail: "123 Tech Street",
                    subtext: "Silicon Valley, Mumbai 400042"
                  }
                ].map((contact, index) => (
                  <div key={index} className="col-md-3 text-center mb-3">
                    <div 
                      className="contact-item p-3 rounded"
                      style={contactItemStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                      }}
                    >
                      <i className={`${contact.icon} fa-2x mb-3`}></i>
                      <h6 className="mb-2 text-dark">{contact.title}</h6>
                      <p className="mb-1 fw-semibold text-dark">{contact.detail}</p>
                      <small className="text-muted">{contact.subtext}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Modal */}
      {showChat && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <div className="d-flex align-items-center">
                  <div className="bg-white rounded-circle p-2 me-3">
                    <i className="fas fa-headset text-primary fa-lg"></i>
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">Live Chat Support</h5>
                    <small className="opacity-75">We're online and ready to help</small>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowChat(false)}
                ></button>
              </div>
              <div 
                ref={chatContainerRef}
                className="modal-body p-4" 
                style={{height: '400px', overflowY: 'auto', backgroundColor: '#f8f9fa'}}
              >
                {chatMessages.map(message => (
                  <div 
                    key={message.id} 
                    className={`d-flex mb-3 ${
                      message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'
                    }`}
                  >
                    <div 
                      className={`p-3 rounded-3 ${
                        message.sender === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-white border text-dark shadow-sm'
                      }`}
                      style={{ maxWidth: '70%' }}
                    >
                      <div style={messageTextStyle}>{message.text}</div>
                      <div 
                        className={`small mt-1 ${
                          message.sender === 'user' ? 'text-white-50' : 'text-muted'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer border-0 bg-light">
                <form onSubmit={handleSendMessage} className="w-100">
                  <div className="input-group input-group-lg">
                    <input
                      type="text"
                      className="form-control border-primary"
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button className="btn btn-primary px-4" type="submit">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;