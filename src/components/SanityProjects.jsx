import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { client, urlFor } from '../sanity/client';

const SanityProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await client.fetch(`
          *[_type == "project" && featured == true] | order(order asc) {
            _id,
            title,
            description,
            image,
            techStack,
            githubLink,
            liveLink,
            gradient
          }
        `);
        setProjects(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    viewport: { once: true, margin: "-100px" }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-apple-grey rounded-apple h-96 animate-pulse" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-apple-grey rounded-apple p-12 text-center">
        <p className="text-zinc-600">No projects yet. Add some in Sanity Studio!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <motion.div
          key={project._id}
          {...fadeInUp}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay: index * 0.1,
          }}
          whileHover={{ scale: 1.02 }}
          className={`bg-gradient-to-br ${project.gradient} rounded-apple p-8 hover:shadow-2xl transition-shadow duration-300 flex flex-col`}
        >
          {project.image && (
            <img
              src={urlFor(project.image).width(400).url()}
              alt={project.title}
              className="w-full h-48 object-cover rounded-2xl mb-6"
            />
          )}
          <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
            {project.title}
          </h3>
          <p className="text-white/90 mb-6 leading-relaxed flex-1">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((tech, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium"
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
        </motion.div>
      ))}
    </div>
  );
};

export default SanityProjects;
