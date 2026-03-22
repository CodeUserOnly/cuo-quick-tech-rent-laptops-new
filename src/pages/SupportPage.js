import React, { useState, useEffect, useRef } from 'react';

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('faq');
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
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  const faqCategories = [
    {
      title: "Rental Process",
      icon: "fas fa-shopping-cart",
      gradient: "linear-gradient(135deg, #667eea, #764ba2)",
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
      gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
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
      gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
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
      gradient: "linear-gradient(135deg, #fa709a, #fee140)",
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
    // Add styles WITHOUT resetting all styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      
      .support-page-wrapper .animate-on-scroll {
        opacity: 0;
        animation: fadeIn 0.6s ease-out forwards;
      }
      
      .support-page-wrapper .clickable-card {
        min-height: 48px;
        cursor: pointer;
      }
      
      /* Only target nav-links within support page, not global ones */
      .support-page-wrapper .nav-link {
        min-height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
      }
      
      /* Prevent any styles from affecting header/navbar */
      .support-page-wrapper {
        font-family: inherit;
      }
      
      /* Ensure accordion buttons don't affect global styles */
      .support-page-wrapper .accordion-button {
        background: white;
      }
      
      .support-page-wrapper .accordion-button:focus {
        box-shadow: none;
      }
    `;
    document.head.appendChild(styleSheet);

    // Animate cards on load
    const timer = setTimeout(() => {
      setAnimatedCards([0, 1, 2]);
    }, 100);

    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showChat) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showChat]);

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
      setIsTyping(true);

      // Simulate auto-reply
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          "I understand your concern. Let me help you with that!",
          "Thanks for reaching out! I'll assist you with your query.",
          "That's a great question! Here's what you need to know.",
          "I appreciate your patience. Let me get that information for you."
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

  const closeChat = () => {
    setShowChat(false);
  };

  const styles = {
    headerTitle: {
      fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      marginBottom: '1rem',
    },
    headerSubtitle: {
      fontSize: 'clamp(1rem, 3vw, 1.2rem)',
      color: '#6c757d',
      maxWidth: '700px',
      margin: '0 auto',
    },
    supportCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    tabButton: {
      padding: '12px 24px',
      fontSize: 'clamp(0.9rem, 3vw, 1rem)',
      fontWeight: 600,
      borderRadius: '50px',
      transition: 'all 0.3s ease',
      border: 'none',
      background: 'transparent',
    },
    contactItem: {
      padding: '1.5rem',
      borderRadius: '15px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    },
    resourceCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '1.5rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
      height: '100%',
    },
  };

  return (
    <div className="support-page-wrapper">
      <div className="container mt-4 mb-5">
        {/* Header Section */}
        <div className="row animate-on-scroll">
          <div className="col-md-12">
            <div className="text-center mb-5">
              <h1 style={styles.headerTitle}>Support Center</h1>
              <p style={styles.headerSubtitle}>We're here to help you 24/7 with any questions or issues</p>
            </div>
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="row mb-5">
          {[
            {
              icon: "fas fa-headset",
              title: "24/7 Live Chat",
              desc: "Get instant help from our support team",
              buttonText: "Start Chat",
              gradient: "linear-gradient(135deg, #667eea, #764ba2)",
              action: startChat
            },
            {
              icon: "fas fa-phone-alt",
              title: "Phone Support",
              desc: "Speak directly with our experts",
              buttonText: "Call Now",
              gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
              action: () => window.open('tel:+919769602148')
            },
            {
              icon: "fas fa-envelope",
              title: "Email Support",
              desc: "Get detailed responses within hours",
              buttonText: "Email Us",
              gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
              action: () => window.open('mailto:quicktechrent@gmail.com')
            }
          ].map((card, index) => (
            <div key={index} className="col-md-4 mb-4 animate-on-scroll">
              <div 
                style={{
                  ...styles.supportCard,
                  transform: animatedCards.includes(index) ? 'translateY(0)' : 'translateY(50px)',
                  opacity: animatedCards.includes(index) ? 1 : 0,
                }}
                className="support-card clickable-card text-center"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
                }}
              >
                <div className="text-center">
                  <div 
                    style={{
                      width: '80px',
                      height: '80px',
                      background: card.gradient,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    }}
                  >
                    <i className={`${card.icon} fa-2x text-white`}></i>
                  </div>
                  <h5 className="fw-semibold mb-2">{card.title}</h5>
                  <p className="text-muted mb-4">{card.desc}</p>
                  <button 
                    className="btn px-4 py-2 text-white"
                    style={{
                      background: card.gradient,
                      borderRadius: '50px',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      border: 'none',
                    }}
                    onClick={card.action}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {card.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="row animate-on-scroll">
          <div className="col-md-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="card-header bg-white border-0 py-3 px-4">
                <ul className="nav nav-pills nav-fill gap-2" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`}
                      style={{
                        ...styles.tabButton,
                        background: activeTab === 'faq' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                        color: activeTab === 'faq' ? 'white' : '#6c757d',
                      }}
                      onClick={() => setActiveTab('faq')}
                    >
                      <i className="fas fa-question-circle me-2"></i>
                      FAQs
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
                      style={{
                        ...styles.tabButton,
                        background: activeTab === 'contact' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                        color: activeTab === 'contact' ? 'white' : '#6c757d',
                      }}
                      onClick={() => setActiveTab('contact')}
                    >
                      <i className="fas fa-envelope me-2"></i>
                      Contact Form
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'resources' ? 'active' : ''}`}
                      style={{
                        ...styles.tabButton,
                        background: activeTab === 'resources' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                        color: activeTab === 'resources' ? 'white' : '#6c757d',
                      }}
                      onClick={() => setActiveTab('resources')}
                    >
                      <i className="fas fa-book me-2"></i>
                      Resources
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-4" style={{ backgroundColor: '#f8f9fa' }}>
                {/* FAQ Tab Content */}
                {activeTab === 'faq' && (
                  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <h3 className="mb-4" style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', fontWeight: 600 }}>
                      Frequently Asked Questions
                    </h3>
                    {faqCategories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="mb-5">
                        <div className="d-flex align-items-center mb-3">
                          <div
                            style={{
                              width: '45px',
                              height: '45px',
                              background: category.gradient,
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '1rem',
                            }}
                          >
                            <i className={`${category.icon} text-white`}></i>
                          </div>
                          <h4 className="mb-0" style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.4rem)', fontWeight: 600 }}>
                            {category.title}
                          </h4>
                        </div>
                        <div className="accordion" id={`accordion${categoryIndex}`}>
                          {category.questions.map((faq, faqIndex) => (
                            <div key={faqIndex} className="accordion-item border-0 mb-3" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                              <h2 className="accordion-header">
                                <button
                                  className="accordion-button collapsed"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#collapse${categoryIndex}${faqIndex}`}
                                  style={{
                                    background: 'white',
                                    fontWeight: 600,
                                    padding: '1rem 1.25rem',
                                    fontSize: 'clamp(0.95rem, 3vw, 1rem)',
                                    border: 'none',
                                  }}
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
                                <div className="accordion-body" style={{ background: '#f8f9fa', color: '#6c757d', lineHeight: 1.6 }}>
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

                {/* Contact Form Tab Content */}
                {activeTab === 'contact' && (
                  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <div className="row justify-content-center">
                      <div className="col-lg-8">
                        <div className="text-center mb-4">
                          <h3 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 600 }}>Contact Our Support Team</h3>
                          <p className="text-muted">We'll get back to you within 24 hours</p>
                        </div>
                        <form onSubmit={handleContactSubmit}>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-semibold">Full Name *</label>
                              <input
                                type="text"
                                className="form-control form-control-lg"
                                style={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}
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
                                style={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}
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
                              style={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}
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
                              style={{ borderRadius: '12px', border: '1px solid #e0e0e0', resize: 'none' }}
                              value={contactForm.message}
                              onChange={handleContactChange}
                              placeholder="Please describe your issue or question in detail..."
                              required
                            ></textarea>
                          </div>
                          <div className="text-center">
                            <button 
                              type="submit" 
                              className="btn btn-lg px-5 text-white"
                              style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderRadius: '50px',
                                fontWeight: 600,
                                border: 'none',
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <i className="fas fa-paper-plane me-2"></i>
                              Send Message
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resources Tab Content */}
                {activeTab === 'resources' && (
                  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <h3 className="mb-4" style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', fontWeight: 600 }}>Helpful Resources</h3>
                    <div className="row">
                      {[
                        {
                          icon: "fas fa-download",
                          title: "Setup Guides",
                          desc: "Step-by-step guides for setting up your rented laptop and software.",
                          gradient: "linear-gradient(135deg, #667eea, #764ba2)",
                          buttons: ["Windows Guide", "macOS Guide", "Software Setup"]
                        },
                        {
                          icon: "fas fa-video",
                          title: "Video Tutorials",
                          desc: "Watch video tutorials for common tasks and troubleshooting.",
                          gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
                          buttons: ["Getting Started", "Troubleshooting", "Advanced Features"]
                        },
                        {
                          icon: "fas fa-file-alt",
                          title: "Documentation",
                          desc: "Comprehensive documentation for all our services and policies.",
                          gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
                          buttons: ["Rental Policy", "Terms of Service", "Privacy Policy"]
                        },
                        {
                          icon: "fas fa-tools",
                          title: "Troubleshooting",
                          desc: "Common issues and their solutions for quick problem resolution.",
                          gradient: "linear-gradient(135deg, #fa709a, #fee140)",
                          buttons: ["WiFi Issues", "Performance", "Software Problems"]
                        }
                      ].map((resource, index) => (
                        <div key={index} className="col-md-6 mb-4">
                          <div 
                            style={styles.resourceCard}
                            className="resource-card"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-5px)';
                              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
                            }}
                          >
                            <div className="d-flex align-items-center mb-3">
                              <div
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  background: resource.gradient,
                                  borderRadius: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '1rem',
                                }}
                              >
                                <i className={`${resource.icon} text-white fa-lg`}></i>
                              </div>
                              <h5 className="mb-0 fw-semibold">{resource.title}</h5>
                            </div>
                            <p className="text-muted mb-3">{resource.desc}</p>
                            <div className="d-flex flex-wrap gap-2">
                              {resource.buttons.map((btn, btnIndex) => (
                                <button 
                                  key={btnIndex}
                                  className="btn btn-sm px-3 py-2"
                                  style={{
                                    background: 'white',
                                    border: `1px solid ${resource.gradient.split(',')[0].split('(')[1] || '#667eea'}`,
                                    color: resource.gradient.split(',')[0].split('(')[1] || '#667eea',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  {btn}
                                </button>
                              ))}
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

        {/* Contact Information */}
        <div className="row mt-5 animate-on-scroll">
          <div className="col-md-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="card-body p-5">
                <h4 className="mb-4 text-center" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 600 }}>
                  Other Ways to Reach Us
                </h4>
                <div className="row">
                  {[
                    {
                      icon: "fas fa-envelope",
                      title: "Email",
                      detail: "quicktechrent@gmail.com",
                      subtext: "Response within 2 hours",
                      gradient: "linear-gradient(135deg, #667eea, #764ba2)"
                    },
                    {
                      icon: "fas fa-phone-alt",
                      title: "Phone",
                      detail: "+91 9769602148",
                      subtext: "24/7 available",
                      gradient: "linear-gradient(135deg, #f093fb, #f5576c)"
                    },
                    {
                      icon: "fas fa-clock",
                      title: "Business Hours",
                      detail: "Mon-Fri: 9AM-6PM IST",
                      subtext: "Sat: 10AM-4PM IST",
                      gradient: "linear-gradient(135deg, #4facfe, #00f2fe)"
                    },
                    {
                      icon: "fas fa-map-marker-alt",
                      title: "Address",
                      detail: "123 Tech Street",
                      subtext: "Silicon Valley, Mumbai 400042",
                      gradient: "linear-gradient(135deg, #fa709a, #fee140)"
                    }
                  ].map((contact, index) => (
                    <div key={index} className="col-md-3 text-center mb-3">
                      <div 
                        style={styles.contactItem}
                        className="contact-item clickable-card"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa, #ffffff)';
                          e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.background = '';
                          e.currentTarget.style.boxShadow = '';
                        }}
                      >
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            background: contact.gradient,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                          }}
                        >
                          <i className={`${contact.icon} text-white fa-2x`}></i>
                        </div>
                        <h6 className="mb-2 fw-semibold">{contact.title}</h6>
                        <p className="mb-1 text-dark fw-medium">{contact.detail}</p>
                        <small className="text-muted">{contact.subtext}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Chat Modal */}
      {showChat && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={closeChat}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '500px',
              height: '600px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'modalSlideIn 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                padding: '20px',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i className="fas fa-headset" style={{ color: '#667eea', fontSize: '20px' }}></i>
                </div>
                <div>
                  <h5 style={{ margin: 0, fontWeight: 'bold' }}>Live Chat Support</h5>
                  <small style={{ opacity: 0.9 }}>We're online and ready to help</small>
                </div>
              </div>
              <button
                onClick={closeChat}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {/* Messages Area */}
            <div
              ref={chatContainerRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                backgroundColor: '#f8f9fa',
              }}
            >
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 15px',
                      borderRadius: message.sender === 'user' ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
                      backgroundColor: message.sender === 'user' ? '#667eea' : 'white',
                      color: message.sender === 'user' ? 'white' : '#333',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ fontSize: '14px', lineHeight: 1.4 }}>{message.text}</div>
                    <div
                      style={{
                        fontSize: '10px',
                        marginTop: '5px',
                        opacity: 0.7,
                        color: message.sender === 'user' ? 'rgba(255,255,255,0.8)' : '#999',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
                  <div
                    style={{
                      backgroundColor: 'white',
                      padding: '10px 15px',
                      borderRadius: '18px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{ animation: 'pulse 1s infinite' }}>•</span>
                      <span style={{ animation: 'pulse 1s infinite 0.2s' }}>•</span>
                      <span style={{ animation: 'pulse 1s infinite 0.4s' }}>•</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div
              style={{
                padding: '15px',
                borderTop: '1px solid #e0e0e0',
                backgroundColor: 'white',
              }}
            >
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: '10px 15px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '25px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;