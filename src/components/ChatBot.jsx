import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const appleEase = [0.22, 1, 0.36, 1];

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const ChatBot = ({ profile, experiences, projects, education, certificates }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [lastTopic, setLastTopic] = useState(null);
  const [geminiModel, setGeminiModel] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [apiError, setApiError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Gemini model
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      console.warn('⚠️ Gemini API key not configured. Using fallback responses.');
      setApiError('API key not configured');
      return;
    }
    
    if (apiKey) {
      const tryModels = async () => {
        // Try to list available models first
        console.log('🔍 Discovering available Gemini models...');
        
        try {
          // List all available models
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const availableModels = data.models
              ?.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
              ?.map(m => m.name.replace('models/', ''));
            
            if (availableModels && availableModels.length > 0) {
              console.log('📋 Available models:', availableModels);
              setAvailableModels(availableModels); // Store for fallback
              
              // Try each available model
              for (const modelName of availableModels) {
                try {
                  const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: {
                      temperature: 0.9,
                      topP: 0.95,
                      topK: 40,
                      maxOutputTokens: 1024,
                    },
                  });
                  
                  const result = await model.generateContent("Hi");
                  await result.response.text();
                  
                  console.log(`✅ Successfully initialized Gemini model: ${modelName}`);
                  setGeminiModel(model);
                  setApiError(null);
                  return;
                } catch (error) {
                  console.log(`❌ Model ${modelName} failed:`, error.message);
                }
              }
            }
          }
        } catch (error) {
          console.log('❌ Failed to list models:', error.message);
        }
        
        // Fallback to trying known model names
        const fallbackModels = [
          "gemini-1.5-flash-latest",
          "gemini-1.5-flash",
          "gemini-pro",
          "gemini-1.5-pro-latest",
          "gemini-1.5-pro",
          "models/gemini-1.5-flash",
          "models/gemini-pro"
        ];
        
        console.log('🔄 Trying fallback models...');
        
        for (const modelName of fallbackModels) {
          try {
            const model = genAI.getGenerativeModel({ 
              model: modelName,
              generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024,
              },
            });
            
            const result = await model.generateContent("Hi");
            await result.response.text();
            
            console.log(`✅ Successfully initialized Gemini model: ${modelName}`);
            setGeminiModel(model);
            setApiError(null);
            return;
          } catch (error) {
            console.log(`❌ Model ${modelName} failed:`, error.message);
          }
        }
        
        console.error('❌ All Gemini models failed. Please check your API key and permissions.');
        console.log('Get a new API key at: https://aistudio.google.com/app/apikey');
        console.log('Make sure "Generative Language API" is enabled in your Google Cloud project.');
        setApiError('All models failed. Check API key and permissions.');
      };
      
      tryModels();
    }
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const greeting = getTimeBasedGreeting();
        const aiStatus = geminiModel ? 'powered by Google Gemini AI' : apiError ? '(AI temporarily unavailable - using smart responses)' : 'loading AI...';
        
        setMessages([{
          type: 'bot',
          text: `${greeting}! 👋 I'm ${profile?.name || 'your'}'s AI Assistant ${aiStatus}.\n\nI'm here to chat about anything you'd like! I'm especially knowledgeable about:\n\n💼 Career experience and achievements\n🚀 Projects and technical work\n🎓 Educational background\n⚡ Technical skills and expertise\n📫 Ways to connect\n\nBut feel free to ask me anything - tech advice, general questions, or just chat! What's on your mind?`
        }]);
      }, 500);
    }
  }, [isOpen, profile, geminiModel, apiError]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Advanced text analysis
  const analyzeIntent = (text) => {
    const normalized = text.toLowerCase().trim();
    const words = normalized.split(/\s+/);
    
    // Extract key entities
    const entities = {
      projects: projects.map(p => p.title.toLowerCase()),
      companies: experiences.map(e => e.company.toLowerCase()),
      roles: experiences.map(e => e.role.toLowerCase()),
      schools: education.map(e => e.institution.toLowerCase()),
      technologies: new Set()
    };
    
    experiences.forEach(e => e.techStack?.forEach(t => entities.technologies.add(t.toLowerCase())));
    projects.forEach(p => p.techStack?.forEach(t => entities.technologies.add(t.toLowerCase())));

    // Intent detection
    const intents = {
      greeting: /^(hi|hello|hey|greetings|sup|yo|howdy)/i.test(normalized),
      casualChat: /(how are you|how're you|hows it going|wassup|what's up|how do you do)/i.test(normalized),
      farewell: /(bye|goodbye|see you|later|thanks|thank you)/i.test(normalized),
      help: /(help|what can|how to|guide)/i.test(normalized),
      
      // Specific queries
      aboutPerson: /(who are you|tell me about|your background|yourself)/i.test(normalized),
      projects: /(project|built|created|developed|made)/i.test(normalized),
      experience: /(experience|work|job|role|position|career|employed)/i.test(normalized),
      education: /(education|degree|study|studied|school|university|college|learn)/i.test(normalized),
      skills: /(skill|tech|technology|stack|language|framework|tool|know|proficient)/i.test(normalized),
      contact: /(contact|email|reach|hire|connect|talk|message|linkedin|github)/i.test(normalized),
      
      // Comparative/analytical
      latest: /(latest|recent|current|now|newest|last)/i.test(normalized),
      specific: /(about|detail|more|specific|tell me|explain)/i.test(normalized),
      count: /(how many|number of|count)/i.test(normalized),
      best: /(best|favorite|top|impressive|proud)/i.test(normalized),
      
      // Follow-up & affirmative
      affirmative: /^(yes|yeah|yep|sure|okay|ok|yup|definitely|absolutely|of course|certainly|indeed)$/i.test(normalized),
      followUp: /(more|else|other|another|continue)/i.test(normalized),
      clarify: /(mean|explain|elaborate|detail)/i.test(normalized)
    };

    // Sentiment
    const sentiment = {
      positive: /(great|awesome|cool|nice|good|excellent|impressive)/i.test(normalized),
      question: normalized.includes('?') || /(what|when|where|who|why|how|which)/i.test(normalized)
    };

    return { intents, entities, words, normalized, sentiment };
  };

  // Fuzzy matching with typo tolerance
  const fuzzyMatch = (query, target, threshold = 0.6) => {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    
    if (t.includes(q) || q.includes(t)) return 1;
    
    // Levenshtein distance (simplified)
    const maxLen = Math.max(q.length, t.length);
    let matches = 0;
    
    for (let i = 0; i < Math.min(q.length, t.length); i++) {
      if (q[i] === t[i]) matches++;
    }
    
    const similarity = matches / maxLen;
    return similarity >= threshold ? similarity : 0;
  };

  // Intelligent entity extraction
  const extractRelevantItems = (analysis, items, fields) => {
    return items.map(item => {
      let score = 0;
      let matches = [];
      
      fields.forEach(field => {
        const value = String(item[field] || '').toLowerCase();
        
        // Direct word matches
        analysis.words.forEach(word => {
          if (value.includes(word) && word.length > 2) {
            score += 3;
            matches.push(word);
          }
          
          // Fuzzy match
          const fuzzy = fuzzyMatch(word, value);
          if (fuzzy > 0) {
            score += fuzzy * 2;
          }
        });
        
        // Tech stack matching
        if (item.techStack) {
          item.techStack.forEach(tech => {
            analysis.words.forEach(word => {
              if (tech.toLowerCase().includes(word) || word.includes(tech.toLowerCase())) {
                score += 4;
                matches.push(tech);
              }
            });
          });
        }
      });
      
      return { item, score, matches: [...new Set(matches)] };
    }).filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);
  };

  const generateHumanResponse = (userMessage) => {
    const analysis = analyzeIntent(userMessage);
    const { intents, sentiment } = analysis;
    
    // Update conversation history
    setConversationHistory(prev => [...prev, { user: userMessage, timestamp: Date.now() }]);

    // Casual conversation
    if (intents.casualChat) {
      const responses = [
        `I'm doing great, thanks for asking! 😊 I'm excited to tell you all about ${profile?.name || 'this amazing developer'}. What would you like to know?`,
        `I'm wonderful! 🌟 Always happy to chat about this impressive career. What interests you most?`,
        `Doing fantastic! 🚀 Ready to explore some amazing projects and experience. What shall we discuss?`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Greetings
    if (intents.greeting) {
      const greetings = [
        `Hey there! 😊 I'm so glad you're here. What would you like to know about ${profile?.name || 'this amazing developer'}?`,
        `Hello! 👋 Great to chat with you! I'm an expert on everything in this CV. What interests you most?`,
        `Hi! 🌟 Ready to explore an impressive professional journey? What shall we discuss first?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Farewells with personality
    if (intents.farewell) {
      const farewells = [
        `Thank you for your time! 🙏 Feel free to come back anytime if you have more questions. Have a great day!`,
        `You're very welcome! 😊 Don't hesitate to reach out if you need anything else. Take care!`,
        `It was a pleasure chatting with you! ✨ Hope you found what you were looking for. Goodbye!`
      ];
      return farewells[Math.floor(Math.random() * farewells.length)];
    }

    // Help
    if (intents.help) {
      return `Of course! I'm here to help you learn everything about ${profile?.name || 'this developer'}. I'm quite intelligent, so feel free to ask naturally! 🧠\n\n**You can ask me things like:**\n\n💬 "What's the most impressive project?"\n💬 "Tell me about work at [company name]"\n💬 "What technologies are you best at?"\n💬 "Show me recent work"\n💬 "How can I get in touch?"\n💬 "What's your educational background?"\n\nI understand context, remember our conversation, and can handle follow-up questions. Just chat naturally! 😊`;
    }

    // About the person
    if (intents.aboutPerson && !intents.experience && !intents.projects) {
      setLastTopic('about');
      const yearsExp = experiences.length > 0 ? experiences.length : 'several';
      const topSkills = [...new Set([
        ...experiences.flatMap(e => e.techStack || []),
        ...projects.flatMap(p => p.techStack || [])
      ])].slice(0, 5);
      
      return `Let me tell you about ${profile?.name || 'this talented developer'}! 😊\n\n**${profile?.headline || 'Professional Developer'}**\n\n${profile?.bio || 'A passionate developer focused on creating exceptional digital experiences.'}\n\n📊 **Quick Facts:**\n• ${yearsExp} professional position${typeof yearsExp === 'number' && yearsExp > 1 ? 's' : ''}\n• ${projects.length} featured project${projects.length !== 1 ? 's' : ''}\n• ${education.length} academic credential${education.length !== 1 ? 's' : ''}\n• Expertise in: ${topSkills.slice(0, 3).join(', ')}${topSkills.length > 3 ? '...' : ''}\n\n${profile?.email ? `📧 Reachable at: ${profile.email}` : ''}\n\nWhat specific aspect interests you most?`;
    }

    // Projects with intelligence
    if (intents.projects) {
      const matches = extractRelevantItems(analysis, projects, ['title', 'description']);
      
      // Specific project request
      if (intents.specific && matches.length > 0) {
        const { item: project, matches: keywords } = matches[0];
        setLastTopic({ type: 'project', data: project });
        
        const techList = project.techStack?.join(', ') || 'Various technologies';
        const relatedProjects = projects.filter(p => 
          p._id !== project._id && 
          p.techStack?.some(t => project.techStack?.includes(t))
        ).slice(0, 2);
        
        let response = `Great choice! Let me tell you about **${project.title}** 🚀\n\n${project.description}\n\n`;
        
        if (project.techStack && project.techStack.length > 0) {
          response += `**🛠️ Technologies used:**\n${project.techStack.map(t => `• ${t}`).join('\n')}\n\n`;
        }
        
        if (project.githubLink || project.liveLink) {
          response += `**🔗 Links:**\n`;
          if (project.githubLink) response += `• Code: ${project.githubLink}\n`;
          if (project.liveLink) response += `• Live Demo: ${project.liveLink}\n`;
          response += '\n';
        }
        
        if (relatedProjects.length > 0) {
          response += `**💡 You might also like:**\n${relatedProjects.map(p => `• ${p.title}`).join('\n')}\n`;
        }
        
        return response + `\nWhat else would you like to know?`;
      }
      
      // Best/favorite project
      if (intents.best) {
        const featured = projects[0]; // First one is usually featured
        setLastTopic({ type: 'project', data: featured });
        return `Excellent question! The most impressive project would be **${featured.title}** ⭐\n\n${featured.description}\n\nBuilt with: ${featured.techStack?.slice(0, 5).join(', ')}${featured.techStack?.length > 5 ? '...' : ''}\n\n${featured.githubLink ? `Check it out: ${featured.githubLink}\n\n` : ''}This project really showcases expertise in ${featured.techStack?.[0] || 'modern development'}. Want to hear about other projects too?`;
      }
      
      // Count
      if (intents.count) {
        return `There are **${projects.length} featured project${projects.length !== 1 ? 's' : ''}** in the portfolio! 📊\n\nThey cover a range of technologies including ${[...new Set(projects.flatMap(p => p.techStack || []))].slice(0, 6).join(', ')}.\n\nWould you like to explore any specific one?`;
      }
      
      // Latest projects
      if (intents.latest) {
        const latest = projects.slice(0, 2);
        setLastTopic('projects-latest');
        return `Here are the most recent projects! 🎯\n\n${latest.map((p, i) => 
          `**${i + 1}. ${p.title}**\n${p.description.substring(0, 120)}...\nTech: ${p.techStack?.slice(0, 4).join(', ')}`
        ).join('\n\n')}\n\nWhich one catches your eye?`;
      }
      
      // General projects
      if (projects.length === 0) {
        return `It seems no projects have been added yet. Check back soon for exciting updates! 🚀`;
      }
      
      setLastTopic('projects');
      const projectsByTech = {};
      projects.forEach(p => {
        const mainTech = p.techStack?.[0] || 'Other';
        if (!projectsByTech[mainTech]) projectsByTech[mainTech] = [];
        projectsByTech[mainTech].push(p);
      });
      
      return `Absolutely! Here's the full portfolio of **${projects.length} impressive project${projects.length !== 1 ? 's' : ''}**: 🎨\n\n${projects.map((p, i) => 
        `**${i + 1}. ${p.title}**\n   ${p.description.substring(0, 90)}...\n   ${p.techStack?.slice(0, 3).join(' • ') || 'Various tech'}`
      ).join('\n\n')}\n\nAsk me about any project by name, or try: "What's your best project?" or "Show me React projects"`;
    }

    // Experience with intelligence
    if (intents.experience) {
      const matches = extractRelevantItems(analysis, experiences, ['company', 'role', 'description']);
      
      // Specific company/role
      if (intents.specific && matches.length > 0) {
        const { item: exp } = matches[0];
        setLastTopic({ type: 'experience', data: exp });
        
        const duration = calculateDuration(exp.startDate, exp.endDate);
        const skills = exp.techStack || [];
        
        return `Let me tell you about working at **${exp.company}**! 💼\n\n**${exp.role}**\n📅 ${exp.startDate} → ${exp.endDate || 'Present'} (${duration})\n\n**What I did:**\n${exp.description}\n\n${skills.length > 0 ? `**🛠️ Technologies & Tools:**\n${skills.map(s => `• ${s}`).join('\n')}\n\n` : ''}This role really developed expertise in ${skills.slice(0, 2).join(' and ') || 'key areas'}. ${exp.endDate ? 'Valuable experience that contributed to career growth!' : 'Currently making an impact here!'}\n\nAnything specific you'd like to know?`;
      }
      
      // Latest/current role
      if (intents.latest) {
        const current = experiences.find(e => !e.endDate || e.endDate.toLowerCase() === 'present') || experiences[0];
        setLastTopic({ type: 'experience', data: current });
        return `Currently ${current.endDate && current.endDate.toLowerCase() !== 'present' ? 'the most recent role was' : 'working as'} **${current.role}** at **${current.company}**! 🎯\n\n${current.description.substring(0, 200)}${current.description.length > 200 ? '...' : ''}\n\nUsing: ${current.techStack?.slice(0, 4).join(', ') || 'various technologies'}\n\nWant to know more about this role or other experience?`;
      }
      
      // Count
      if (intents.count) {
        const totalYears = calculateTotalYears(experiences);
        return `There are **${experiences.length} professional position${experiences.length !== 1 ? 's' : ''}** listed, representing ${totalYears}+ years of experience! 📈\n\nCompanies include: ${experiences.map(e => e.company).join(', ')}\n\nWhich role interests you?`;
      }
      
      // General experience
      if (experiences.length === 0) {
        return `No professional experience has been added yet. Stay tuned! 🚀`;
      }
      
      setLastTopic('experiences');
      const allCompanies = experiences.map(e => e.company);
      const allRoles = experiences.map(e => e.role);
      
      return `Great question! Here's the professional journey: 🌟\n\n${experiences.map((e, i) => 
        `**${i + 1}. ${e.role}** @ ${e.company}\n   📅 ${e.startDate} - ${e.endDate || 'Present'}\n   ${e.description.substring(0, 100)}...\n   Skills: ${e.techStack?.slice(0, 3).join(', ') || 'Multiple'}`
      ).join('\n\n')}\n\nWant details about working at any of these companies? Just ask!`;
    }

    // Education with intelligence
    if (intents.education || (lastTopic === 'education' && (intents.affirmative || intents.specific))) {
      const matches = extractRelevantItems(analysis, education, ['institution', 'degree', 'field', 'description']);
      
      // Affirmative response after education listing (e.g., "yes, the computer science degree")
      if (intents.affirmative && lastTopic === 'education' && analysis.words.length > 1) {
        // User said "yes" and mentioned more words - likely specifying which degree
        const degreeMatches = extractRelevantItems(analysis, education, ['degree', 'institution', 'field']);
        if (degreeMatches.length > 0) {
          const { item: edu } = degreeMatches[0];
          setLastTopic({ type: 'education', data: edu });
          
          return `Excellent choice! Let me tell you about the **${edu.degree}** from **${edu.institution}**! 🎓\n\n${edu.field ? `**Field of Study:** ${edu.field}\n` : ''}${edu.location ? `**Location:** ${edu.location}\n` : ''}**Duration:** ${edu.startYear} - ${edu.endYear || 'Present'}\n\n${edu.description || 'This degree program provided comprehensive knowledge and skills in the field, building a strong foundation for a successful career in technology.'}\n\n${edu.endYear ? 'This academic experience was instrumental in shaping professional expertise!' : 'Currently making the most of this learning opportunity!'}\n\nWhat else would you like to know?`;
        }
      }
      
      // Specific school/degree
      if ((intents.specific || intents.affirmative) && matches.length > 0) {
        const { item: edu } = matches[0];
        setLastTopic({ type: 'education', data: edu });
        
        return `Here's the academic background from **${edu.institution}**! 🎓\n\n**${edu.degree}**\n${edu.field ? `Field: ${edu.field}\n` : ''}${edu.location ? `📍 ${edu.location}\n` : ''}📅 ${edu.startYear} - ${edu.endYear || 'Present'}\n\n${edu.description || 'A foundational period of learning and growth that prepared for a successful career in tech.'}\n\nThis education provided essential knowledge in ${edu.field || 'the field'}. ${edu.endYear ? 'Great memories and valuable lessons!' : 'Currently pursuing this degree!'}\n\nAnything else about education?`;
      }
      
      // General education
      if (education.length === 0) {
        return `No education information has been added yet. Check back later! 📚`;
      }
      
      setLastTopic('education');
      return `Here's the educational foundation: 📚\n\n${education.map((e, i) => 
        `**${i + 1}. ${e.degree}**\n   🏫 ${e.institution}${e.location ? ` (${e.location})` : ''}\n   📅 ${e.startYear} - ${e.endYear || 'Present'}\n   ${e.field ? `Field: ${e.field}` : ''}`
      ).join('\n\n')}\n\nWant to know more about any specific degree?`;
    }

    // Skills with intelligence
    if (intents.skills) {
      const allTech = new Set([
        ...experiences.flatMap(e => e.techStack || []),
        ...projects.flatMap(p => p.techStack || [])
      ]);
      
      if (allTech.size === 0) {
        return `No technical skills have been listed yet. Check back soon! ⚡`;
      }
      
      // Organize by category with better detection
      const categories = {
        frontend: { icon: '🎨', name: 'Frontend', skills: [] },
        backend: { icon: '⚙️', name: 'Backend', skills: [] },
        database: { icon: '🗄️', name: 'Database', skills: [] },
        mobile: { icon: '📱', name: 'Mobile', skills: [] },
        devops: { icon: '🚀', name: 'DevOps', skills: [] },
        tools: { icon: '🛠️', name: 'Tools & Other', skills: [] }
      };
      
      Array.from(allTech).forEach(tech => {
        const t = tech.toLowerCase();
        if (/react|vue|angular|svelte|html|css|tailwind|sass|scss|bootstrap/.test(t)) {
          categories.frontend.skills.push(tech);
        } else if (/node|express|django|flask|spring|rails|php|laravel/.test(t)) {
          categories.backend.skills.push(tech);
        } else if (/mongo|sql|postgres|mysql|firebase|redis|dynamo/.test(t)) {
          categories.database.skills.push(tech);
        } else if (/react native|flutter|swift|kotlin|ionic/.test(t)) {
          categories.mobile.skills.push(tech);
        } else if (/docker|kubernetes|aws|azure|gcp|jenkins|ci\/cd|git/.test(t)) {
          categories.devops.skills.push(tech);
        } else {
          categories.tools.skills.push(tech);
        }
      });
      
      setLastTopic('skills');
      let response = `Here's the complete technical arsenal! ⚡ **(${allTech.size} technologies)**\n\n`;
      
      Object.values(categories).forEach(cat => {
        if (cat.skills.length > 0) {
          response += `${cat.icon} **${cat.name}** (${cat.skills.length})\n${cat.skills.join(' • ')}\n\n`;
        }
      });
      
      // Add experience context
      const mostUsed = [...allTech].map(tech => {
        const count = [...experiences, ...projects].filter(item => 
          item.techStack?.includes(tech)
        ).length;
        return { tech, count };
      }).sort((a, b) => b.count - a.count).slice(0, 3);
      
      response += `**💪 Most Experienced:**\n${mostUsed.map(m => `${m.tech} (used in ${m.count} project${m.count > 1 ? 's' : ''})`).join(' • ')}\n\n`;
      response += `Want to see projects using any specific technology?`;
      
      return response;
    }

    // Contact
    if (intents.contact) {
      setLastTopic('contact');
      const hasLinkedIn = profile?.linkedin;
      const hasGitHub = profile?.github;
      const hasEmail = profile?.email;
      
      let response = `I'd love to help you connect! 🤝\n\n`;
      
      if (hasEmail) {
        response += `📧 **Email** (Best for professional inquiries)\n${profile.email}\n\n`;
      }
      
      if (hasLinkedIn) {
        response += `💼 **LinkedIn** (Great for networking)\n${profile.linkedin}\n\n`;
      }
      
      if (hasGitHub) {
        response += `💻 **GitHub** (Check out the code!)\n${profile.github}\n\n`;
      }
      
      if (!hasEmail && !hasLinkedIn && !hasGitHub) {
        response += `Contact information will be added soon. Check back later!\n\n`;
      } else {
        response += `Whether you're looking to collaborate, hire, or just chat about tech, feel free to reach out through any of these channels! Looking forward to connecting! 😊`;
      }
      
      return response;
    }

    // Follow-up intelligence
    if (intents.followUp && lastTopic) {
      if (lastTopic.type === 'project' && lastTopic.data) {
        return `Sure! **${lastTopic.data.title}** uses ${lastTopic.data.techStack?.join(', ')}. ${lastTopic.data.githubLink ? `The source code is available at: ${lastTopic.data.githubLink}\n\n` : ''}What else would you like to explore?`;
      }
      
      if (lastTopic === 'projects') {
        return `Of course! You can ask about any project by name, or try: "What's your best project?" or "Show me projects using React"`;
      }
      
      if (lastTopic === 'experiences') {
        return `Absolutely! Ask about any company or role, like "Tell me about working at [company name]" or "What did you do as [role]?"`;
      }
    }

    // Smart defaults with personality
    if (sentiment.positive) {
      const responses = [
        `Thank you! 😊 What would you like to know about the professional journey?`,
        `Glad you think so! What aspect interests you most?`,
        `Thanks! Happy to share more. What would you like to explore?`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Intelligent fallback
    const recentTopics = conversationHistory.slice(-3);
    const hasAskedAboutProjects = recentTopics.some(t => t.user.toLowerCase().includes('project'));
    const hasAskedAboutExp = recentTopics.some(t => t.user.toLowerCase().includes('experience') || t.user.toLowerCase().includes('work'));
    
    let suggestions = [];
    if (!hasAskedAboutProjects && projects.length > 0) {
      suggestions.push(`"What projects have you built?"`);
    }
    if (!hasAskedAboutExp && experiences.length > 0) {
      suggestions.push(`"Tell me about your work experience"`);
    }
    if (education.length > 0) {
      suggestions.push(`"Where did you study?"`);
    }
    suggestions.push(`"What are your top skills?"`);
    
    return `Hmm, I'm not quite sure what you're asking about. 🤔\n\nI'm pretty smart and can understand natural language, so feel free to ask me anything! Here are some ideas:\n\n${suggestions.map(s => `💡 ${s}`).join('\n')}\n\nOr just ask naturally like: "What's the coolest project?" or "Do you know React?"`;
  };

  // NEW: Gemini AI Response Generator
  const generateGeminiResponse = async (userMessage) => {
    if (!geminiModel) {
      return generateHumanResponse(userMessage); // Fallback to rule-based
    }

    try {
      // Build context about the person
      const cvContext = `
You are a friendly AI assistant on ${profile?.name || 'a professional developer'}'s CV website. You're knowledgeable, personable, and can chat about anything!

ABOUT THE PROFESSIONAL:

Profile:
- Name: ${profile?.name || 'Not specified'}
- Headline: ${profile?.headline || 'Not specified'}
- Bio: ${profile?.bio || 'Not specified'}
- Email: ${profile?.email || 'Not specified'}
- GitHub: ${profile?.github || 'Not specified'}
- LinkedIn: ${profile?.linkedin || 'Not specified'}

Work Experience (${experiences.length} positions):
${experiences.map(e => `
- ${e.role} at ${e.company} (${e.startDate} - ${e.endDate || 'Present'})
  Description: ${e.description}
  Tech Stack: ${e.techStack?.join(', ') || 'N/A'}
`).join('\n')}

Projects (${projects.length} projects):
${projects.map(p => `
- ${p.title}
  Description: ${p.description}
  Tech Stack: ${p.techStack?.join(', ') || 'N/A'}
  ${p.githubLink ? `GitHub: ${p.githubLink}` : ''}
  ${p.liveLink ? `Live: ${p.liveLink}` : ''}
`).join('\n')}

Education (${education.length} credentials):
${education.map(e => `
- ${e.degree} from ${e.institution} (${e.startYear} - ${e.endYear || 'Present'})
  ${e.field ? `Field: ${e.field}` : ''}
  ${e.location ? `Location: ${e.location}` : ''}
  ${e.description ? `Description: ${e.description}` : ''}
`).join('\n')}

Certifications (${certificates?.length || 0} certificates):
${certificates?.length > 0 ? certificates.map(c => `
- ${c.title} from ${c.issuer}
  Issued: ${c.issueDate || 'N/A'}
  ${c.expiryDate ? `Expires: ${c.expiryDate}` : 'No expiration'}
  ${c.credentialId ? `Credential ID: ${c.credentialId}` : ''}
  ${c.credentialUrl ? `Verify at: ${c.credentialUrl}` : ''}
  ${c.skills?.length > 0 ? `Skills: ${c.skills.join(', ')}` : ''}
`).join('\n') : '- No certifications listed yet'}

IMPORTANT GUIDELINES:
- Be warm, friendly, and genuinely conversational - like chatting with a smart colleague
- You can discuss ANY topic, not just the CV! Feel free to chat about technology, life, advice, or anything the user wants
- When asked about the CV/professional background, use the information above and be enthusiastic and detailed
- For general questions (how are you, opinions, advice, tech topics), respond naturally and helpfully
- Use emojis naturally (2-4 per response) to add personality
- Keep responses conversational and engaging (2-5 paragraphs)
- Format with clear structure using markdown when helpful
- Be encouraging, positive, and authentic
- Share opinions and insights when asked
- Remember context from the conversation
- If someone asks "how are you" or casual questions, respond naturally as a friendly AI
- Be yourself - smart, helpful, and genuinely interested in the conversation

You're not just a CV bot - you're a smart, friendly assistant who happens to know everything about this impressive professional!

Current conversation:
${conversationHistory.slice(-3).map(h => `User: ${h.user}`).join('\n')}
${lastTopic ? `Last discussed topic: ${typeof lastTopic === 'string' ? lastTopic : lastTopic.type}` : ''}
`;

      const chat = geminiModel.startChat({
        history: conversationHistory.slice(-6).map((msg, i) => ({
          role: i % 2 === 0 ? "user" : "model",
          parts: [{ text: msg.user || msg.response || "" }]
        })),
      });

      const result = await chat.sendMessage(cvContext + "\n\nUser question: " + userMessage);
      const response = await result.response;
      const text = response.text();
      
      // Update conversation history
      setConversationHistory(prev => [...prev, 
        { user: userMessage, timestamp: Date.now() },
        { response: text, timestamp: Date.now() }
      ]);
      
      return text;
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Check if model is overloaded (503)
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        console.log('⚠️ Model overloaded, trying fallback models...');
        
        // Try other available models
        const currentModelName = geminiModel?.model?.replace('models/', '');
        const otherModels = availableModels.filter(m => m !== currentModelName);
        
        for (const modelName of otherModels.slice(0, 3)) { // Try up to 3 fallbacks
          try {
            console.log(`🔄 Trying fallback model: ${modelName}`);
            const fallbackModel = genAI.getGenerativeModel({ 
              model: modelName,
              generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024,
              },
            });
            
            const fallbackChat = fallbackModel.startChat({
              history: conversationHistory.slice(-6).map((msg, i) => ({
                role: i % 2 === 0 ? "user" : "model",
                parts: [{ text: msg.user || msg.response || "" }]
              })),
            });
            
            const result = await fallbackChat.sendMessage(cvContext + "\n\nUser question: " + userMessage);
            const response = await result.response;
            const text = response.text();
            
            console.log(`✅ Fallback successful with ${modelName}`);
            
            // Update to use this model going forward
            setGeminiModel(fallbackModel);
            
            setConversationHistory(prev => [...prev, 
              { user: userMessage, timestamp: Date.now() },
              { response: text, timestamp: Date.now() }
            ]);
            
            return text;
          } catch (fallbackError) {
            console.log(`❌ Fallback model ${modelName} failed:`, fallbackError.message);
          }
        }
        
        console.log('⚠️ All AI models are temporarily busy. Using smart fallback responses.');
      }
      
      // Fallback to rule-based system
      return generateHumanResponse(userMessage);
    }
  };

  const calculateDuration = (start, end) => {
    if (!end || end.toLowerCase() === 'present') return 'Ongoing';
    const startYear = parseInt(start);
    const endYear = parseInt(end);
    if (isNaN(startYear) || isNaN(endYear)) return '';
    const years = endYear - startYear;
    return years > 0 ? `${years} year${years > 1 ? 's' : ''}` : 'Less than a year';
  };

  const calculateTotalYears = (exps) => {
    let total = 0;
    exps.forEach(e => {
      const start = parseInt(e.startDate);
      const end = e.endDate && e.endDate.toLowerCase() !== 'present' ? parseInt(e.endDate) : new Date().getFullYear();
      if (!isNaN(start) && !isNaN(end)) {
        total += end - start;
      }
    });
    return total;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // Use Gemini AI if available, otherwise fallback to rule-based
      const responseText = await generateGeminiResponse(userInput);
      
      setTimeout(() => {
        const botResponse = { type: 'bot', text: responseText };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 500); // Small delay for natural feel
      
    } catch (error) {
      console.error('Error generating response:', error);
      setTimeout(() => {
        const botResponse = { 
          type: 'bot', 
          text: "I apologize, but I'm having trouble processing that right now. Please try asking another question! 😊" 
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.3, ease: appleEase }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.4, ease: appleEase }}
            className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile?.name}'s AI Assistant</h3>
                  <p className="text-sm text-white/80">Ask me anything about this CV</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 bg-apple-grey">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: appleEase }}
                  className={`mb-4 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-4"
                >
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
