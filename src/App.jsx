import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Github, Linkedin, Mail, ExternalLink, Calendar } from 'lucide-react';
import { client } from './sanity/client';
import ChatBot from './components/ChatBot';
import GenerativeBackground from './components/GenerativeBackground';
import LiveActivity from './components/LiveActivity';

// Apple easing curve
const appleEase = [0.22, 1, 0.36, 1];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: appleEase }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function App() {
  const [profile, setProfile] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [contrastLevel, setContrastLevel] = useState('normal'); // 'low', 'normal', 'high'
  const [ambientLight, setAmbientLight] = useState(null);
  const [githubActivity, setGithubActivity] = useState(0);
  
  // Scroll tracking for hero section
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Transform scroll into animations - more dramatic effects
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Detect system preference for dark mode
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e) => {
      setDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Ambient Light Sensor API for adaptive contrast
  useEffect(() => {
    if ('AmbientLightSensor' in window) {
      try {
        const sensor = new window.AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          const lux = sensor.illuminance;
          setAmbientLight(lux);
          
          // Adjust contrast based on ambient light
          // Very bright (>500 lux): high contrast for readability
          // Normal (50-500 lux): normal contrast
          // Dim (<50 lux): low contrast to reduce eye strain
          if (lux > 500) {
            setContrastLevel('high');
          } else if (lux < 50) {
            setContrastLevel('low');
          } else {
            setContrastLevel('normal');
          }
        });
        sensor.start();
        
        return () => sensor.stop();
      } catch (error) {
        console.log('Ambient Light Sensor not available:', error);
      }
    } else {
      console.log('Ambient Light Sensor API not supported');
    }
  }, []);

  // Apply dark mode and contrast classes to body
  useEffect(() => {
    const bodyClasses = document.body.classList;
    
    // Remove all theme classes
    bodyClasses.remove('dark', 'high-contrast', 'low-contrast');
    
    if (darkMode) {
      bodyClasses.add('dark');
      if (contrastLevel === 'high') {
        bodyClasses.add('high-contrast');
      } else if (contrastLevel === 'low') {
        bodyClasses.add('low-contrast');
      }
    }
  }, [darkMode, contrastLevel]);

  // Toggle dark mode manually
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        const profileData = await client.fetch(`*[_type == "profile"][0]{
          name,
          headline,
          bio,
          email,
          github,
          linkedin
        }`);
        setProfile(profileData);

        // Fetch experiences
        const experiencesData = await client.fetch(`*[_type == "experience"] | order(order asc){
          _id,
          company,
          role,
          startDate,
          endDate,
          description,
          techStack
        }`);
        setExperiences(experiencesData);

        // Fetch projects
        const projectsData = await client.fetch(`*[_type == "project"] | order(order asc){
          _id,
          title,
          description,
          techStack,
          githubLink,
          liveLink,
          gradient
        }`);
        setProjects(projectsData);

        // Fetch education
        const educationData = await client.fetch(`*[_type == "education"] | order(order asc){
          _id,
          institution,
          degree,
          field,
          startYear,
          endYear,
          description,
          location
        }`);
        setEducation(educationData);

        // Fetch certificates
        const certificatesData = await client.fetch(`*[_type == "certificate"] | order(order asc){
          _id,
          title,
          issuer,
          issueDate,
          expiryDate,
          credentialUrl,
          skills,
          image{
            asset->{
              url
            }
          }
        }`);
        setCertificates(certificatesData);

        // Fetch GitHub activity
        if (profileData?.github) {
          try {
            const username = profileData.github.split('/').pop();
            const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
            if (response.ok) {
              const events = await response.json();
              // Count commits in the last 30 days
              const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              const recentCommits = events.filter(event => {
                const eventDate = new Date(event.created_at);
                return eventDate > thirtyDaysAgo && event.type === 'PushEvent';
              }).reduce((total, event) => {
                return total + (event.payload?.commits?.length || 0);
              }, 0);
              setGithubActivity(recentCommits);
              console.log(`🔥 GitHub Activity: ${recentCommits} commits in the last 30 days`);
            }
          } catch (error) {
            console.error('Error fetching GitHub activity:', error);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-transparent rounded-full"
          style={{ borderColor: 'var(--apple-blue)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Generative WebGL Background */}
      <GenerativeBackground githubActivity={githubActivity} />
      
      {/* Dark Mode Toggle */}
      <motion.button
        onClick={toggleDarkMode}
        className="fixed bottom-8 left-8 z-50 p-4 rounded-full shadow-2xl backdrop-blur-md"
        style={{ 
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          border: `2px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={`${darkMode ? 'Light' : 'Dark'} Mode${ambientLight ? ` (${Math.round(ambientLight)} lux)` : ''}`}
      >
        {darkMode ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-primary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-primary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
        {/* Ambient light indicator */}
        {ambientLight !== null && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{
              backgroundColor: contrastLevel === 'high' ? '#FF9500' : contrastLevel === 'low' ? '#5856D6' : '#34C759'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          />
        )}
      </motion.button>

      {/* Frosted Glass Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: appleEase }}
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ 
          backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderBottomColor: 'var(--border-color)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-lg sm:text-xl tracking-tight" style={{ 
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-weight-semibold)'
          }}>
            {profile?.name || 'Portfolio'}
          </h1>
          <div className="flex gap-4 sm:gap-6">
            {profile?.github && (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" 
                 className="transition-colors hover:opacity-70"
                 style={{ color: 'var(--text-secondary)' }}>
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            )}
            {profile?.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                 className="transition-colors hover:opacity-70"
                 style={{ color: 'var(--text-secondary)' }}>
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            )}
            {profile?.email && (
              <a href={`mailto:${profile.email}`}
                 className="transition-colors hover:opacity-70"
                 style={{ color: 'var(--text-secondary)' }}>
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: appleEase }}
        >
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-none mb-4 sm:mb-6"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 80, 
              damping: 12,
              delay: 0.3,
              duration: 1.2
            }}
            style={{
              scale: heroScale,
              y: heroY,
              opacity: heroOpacity,
              color: 'var(--text-primary)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            {profile?.headline || 'Creative Developer'}
          </motion.h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-3xl mb-8 sm:mb-12 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {profile?.bio || 'Building beautiful experiences with modern web technologies.'}
          </p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block text-white px-8 py-4 rounded-full text-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--apple-blue)',
              fontWeight: 'var(--font-weight-semibold)'
            }}
          >
            Get in touch
          </motion.a>
        </motion.div>
      </section>

      {/* Experience Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 overflow-hidden">
        {/* Parallax background element */}
        <motion.div 
          className="absolute inset-0 -z-10 opacity-5"
          initial={{ y: 100 }}
          whileInView={{ y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1.5, ease: appleEase }}
        >
          <div className="absolute top-0 left-0 w-96 h-96 bg-apple-blue rounded-full blur-3xl" />
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: appleEase }}
          className="text-3xl sm:text-4xl md:text-5xl tracking-tighter mb-8 sm:mb-12"
          style={{ 
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          Experience
        </motion.h3>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ staggerChildren: 0.15 }}
          className="space-y-6"
        >
          {experiences.map((exp, index) => (
            <motion.div
              key={exp._id}
              variants={{
                initial: { opacity: 0, y: 60, scale: 0.95 },
                animate: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { 
                    duration: 0.8, 
                    ease: appleEase,
                    delay: index * 0.1
                  }
                }
              }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="experience-card bg-apple-grey p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] hover:shadow-xl transition-shadow duration-500"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h4 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">{exp.role}</h4>
                  <p className="text-lg sm:text-xl text-gray-600">{exp.company}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-500 mt-2 md:mt-0 text-sm sm:text-base">
                  <Calendar className="w-4 h-4" />
                  <span>{exp.startDate} - {exp.endDate || 'Present'}</span>
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">{exp.description}</p>
              {exp.techStack && exp.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {exp.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1.5 bg-white rounded-full text-sm font-medium text-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Education Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-white overflow-hidden">
        {/* Parallax background element */}
        <motion.div 
          className="absolute inset-0 -z-10 opacity-5"
          initial={{ y: -100 }}
          whileInView={{ y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1.5, ease: appleEase }}
        >
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: appleEase }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-8 sm:mb-12"
        >
          Education
        </motion.h3>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ staggerChildren: 0.15 }}
          className="space-y-6"
        >
          {education.map((edu, index) => (
            <motion.div
              key={edu._id}
              variants={{
                initial: { opacity: 0, x: -60, scale: 0.95 },
                animate: { 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  transition: { 
                    duration: 0.8, 
                    ease: appleEase,
                    delay: index * 0.1
                  }
                }
              }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="bg-apple-grey p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] hover:shadow-xl transition-shadow duration-500"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h4 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">{edu.degree}</h4>
                  <p className="text-lg sm:text-xl text-gray-600">{edu.institution}</p>
                  {edu.field && (
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">{edu.field}</p>
                  )}
                </div>
                <div className="text-gray-500 mt-2 md:mt-0 text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{edu.startYear} - {edu.endYear || 'Present'}</span>
                  </div>
                  {edu.location && (
                    <p className="text-sm mt-1">{edu.location}</p>
                  )}
                </div>
              </div>
              {edu.description && (
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{edu.description}</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 overflow-hidden">
          {/* Parallax background */}
          <motion.div 
            className="absolute inset-0 -z-10 opacity-5"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 1.5, ease: appleEase }}
          >
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-yellow-500 rounded-full blur-3xl" />
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: appleEase }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-8 sm:mb-12"
            style={{ 
              color: 'var(--text-primary)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            Certifications
          </motion.h3>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ staggerChildren: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {certificates.map((cert, index) => (
              <motion.div
                key={cert._id}
                variants={{
                  initial: { opacity: 0, y: 40, scale: 0.95 },
                  animate: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { 
                      duration: 0.8, 
                      ease: appleEase,
                      delay: index * 0.1
                    }
                  }
                }}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] hover:shadow-xl transition-shadow duration-500"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                <div className="flex flex-col">
                  <h4 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                    {cert.title}
                  </h4>
                  <p className="text-lg sm:text-xl mb-3" style={{ color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                    {cert.issuer}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {cert.issueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {cert.issueDate}
                      </span>
                    )}
                    {cert.expiryDate && (
                      <span>• Expires: {cert.expiryDate}</span>
                    )}
                  </div>

                  {cert.image?.asset?.url && (
                    <div className="mb-4 rounded-xl overflow-hidden">
                      <img 
                        src={cert.image.asset.url} 
                        alt={cert.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {cert.skills && cert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cert.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: 'var(--apple-blue)',
                            color: '#FFFFFF'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {cert.credentialUrl && (
                    <motion.a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 text-sm font-medium"
                      style={{ color: 'var(--apple-blue)' }}
                      whileHover={{ x: 5 }}
                    >
                      View Certificate
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* GitHub Contribution Calendar */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 overflow-hidden">
        {/* Parallax background */}
        <motion.div 
          className="absolute inset-0 -z-10 opacity-5"
          initial={{ x: -100 }}
          whileInView={{ x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1.5, ease: appleEase }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: appleEase }}
          className="text-3xl sm:text-4xl md:text-5xl tracking-tighter mb-8 sm:mb-12"
          style={{ 
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          GitHub Activity
        </motion.h3>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, ease: appleEase }}
          className="p-8 rounded-[2.5rem]"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          {profile?.github && (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <p className="text-xl mb-2" style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Check out my open source contributions
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Follow my coding journey and see what I'm building
                </p>
              </div>
              
              <motion.a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full transition-all"
                style={{
                  backgroundColor: 'var(--apple-blue)',
                  color: '#FFFFFF',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-6 h-6" />
                <span className="text-lg">View GitHub Profile</span>
                <ExternalLink className="w-5 h-5" />
              </motion.a>

              {/* GitHub Stats using shields.io badges */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <img 
                  src={`https://img.shields.io/github/followers/${profile.github.split('/').pop()}?style=for-the-badge&logo=github&labelColor=${darkMode ? '1C1C1E' : 'F5F5F7'}&color=0A84FF`}
                  alt="GitHub followers"
                  className="h-8"
                />
                <img 
                  src={`https://img.shields.io/github/stars/${profile.github.split('/').pop()}?style=for-the-badge&logo=github&labelColor=${darkMode ? '1C1C1E' : 'F5F5F7'}&color=0A84FF&affiliations=OWNER`}
                  alt="GitHub stars"
                  className="h-8"
                />
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Live Activity Heatmap */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 overflow-hidden">
        {/* Parallax background */}
        <motion.div 
          className="absolute inset-0 -z-10 opacity-5"
          initial={{ y: 50 }}
          whileInView={{ y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1.5, ease: appleEase }}
        >
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: appleEase }}
          className="text-3xl sm:text-4xl md:text-5xl tracking-tighter mb-8 sm:mb-12"
          style={{ 
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          Live Pulse
        </motion.h3>

        <div className="max-w-2xl mx-auto">
          <LiveActivity 
            githubUsername={profile?.github ? profile.github.split('/').pop() : null}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-8 text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Real-time activity from GitHub, location, and coding status
        </motion.p>
      </section>

      {/* Bento Grid - Projects */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 overflow-hidden">
        {/* Parallax background elements */}
        <motion.div 
          className="absolute inset-0 -z-10 opacity-5"
          initial={{ scale: 0.8 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 2, ease: appleEase }}
        >
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl" />
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: appleEase }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-8 sm:mb-12"
        >
          Featured Work
        </motion.h3>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {projects.map((project, index) => {
            // Calculate span for bento grid
            const isLarge = index % 5 === 0;
            const spanClass = isLarge ? 'lg:col-span-2 lg:row-span-2' : '';
            
            return (
              <motion.div
                key={project._id}
                variants={{
                  initial: { opacity: 0, y: 80, scale: 0.9, rotateX: 10 },
                  animate: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1, 
                    rotateX: 0,
                    transition: { 
                      duration: 0.9, 
                      ease: appleEase,
                      delay: index * 0.08
                    }
                  }
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  transition: { duration: 0.4, ease: appleEase } 
                }}
                className={`bg-gradient-to-br ${project.gradient || 'from-blue-500 to-cyan-500'} p-8 rounded-[2.5rem] text-white relative overflow-hidden group ${spanClass}`}
              >
                <div className="relative z-10 h-full flex flex-col">
                  <h4 className="text-2xl font-bold tracking-tight mb-3">{project.title}</h4>
                  <p className="text-white/90 mb-4 leading-relaxed flex-grow">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack?.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                      >
                        <Github className="w-5 h-5" />
                        <span className="text-sm font-medium">Code</span>
                      </a>
                    )}
                    {project.liveLink && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <span className="text-sm font-medium">Live</span>
                      </a>
                    )}
                  </div>
                </div>
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-apple" />
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="bg-apple-grey mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-4 sm:mb-6">Let's work together</h3>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
              I'm always open to discussing new projects and opportunities.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
              {profile?.email && (
                <motion.a
                  href={`mailto:${profile.email}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 bg-apple-blue text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-blue-600 transition-colors text-base sm:text-lg w-full sm:w-auto"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  Email me
                </motion.a>
              )}
              {profile?.linkedin && (
                <motion.a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors text-base sm:text-lg w-full sm:w-auto"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </motion.a>
              )}
            </div>
            <div className="mt-12 pt-8 border-t border-gray-300">
              <p className="text-gray-500">
                © {new Date().getFullYear()} {profile?.name || 'Portfolio'}. Built with React, Tailwind CSS, and Sanity.io
              </p>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <ChatBot 
        profile={profile}
        experiences={experiences}
        projects={projects}
        education={education}
        certificates={certificates}
      />
    </div>
  );
}

export default App;
