export default {
  name: 'profile',
  title: 'Profile',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Your professional headline (e.g., "Senior Frontend Engineer")',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
      description: 'A short bio about yourself',
      validation: (Rule) => Rule.required().max(500),
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'github',
      title: 'GitHub URL',
      type: 'url',
    },
    {
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
    },
    {
      name: 'cvFile',
      title: 'CV PDF',
      type: 'file',
      description: 'Upload your CV as a PDF',
    },
  ],
}
