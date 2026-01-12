import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Code2, Award } from 'lucide-react';
import { client } from '../sanity/client';

const iconMap = {
  briefcase: Briefcase,
  code: Code2,
  award: Award,
};

const SanityExperience = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const data = await client.fetch(`
          *[_type == "experience"] | order(order asc) {
            _id,
            company,
            role,
            startDate,
            endDate,
            description,
            techStack,
            icon
          }
        `);
        setExperiences(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    viewport: { once: true, margin: "-100px" }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-apple p-8 md:p-12 h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className="bg-white rounded-apple p-12 text-center">
        <p className="text-zinc-600">No experience entries yet. Add some in Sanity Studio!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {experiences.map((exp) => {
        const Icon = iconMap[exp.icon] || Briefcase;
        const iconColors = {
          briefcase: 'bg-apple-blue/10 text-apple-blue',
          code: 'bg-purple-500/10 text-purple-600',
          award: 'bg-green-500/10 text-green-600',
        };

        return (
          <motion.div
            key={exp._id}
            {...fadeInUp}
            className="bg-white rounded-apple p-8 md:p-12 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 ${iconColors[exp.icon] || iconColors.briefcase} rounded-2xl`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold tracking-tight">{exp.role}</h3>
                <p className="text-zinc-500">
                  {exp.company} • {exp.startDate} - {exp.endDate || 'Present'}
                </p>
              </div>
            </div>
            <p className="text-zinc-600 leading-relaxed mt-4">{exp.description}</p>
            {exp.techStack && exp.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {exp.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-zinc-100 rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default SanityExperience;
