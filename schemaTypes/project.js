export default {
  name: 'project',
  title: 'Projects',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required().max(400),
    },
    {
      name: 'image',
      title: 'Project Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Technologies used',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'githubLink',
      title: 'GitHub Link',
      type: 'url',
    },
    {
      name: 'liveLink',
      title: 'Live Link',
      type: 'url',
    },
    {
      name: 'gradient',
      title: 'Gradient Colors',
      type: 'string',
      options: {
        list: [
          {title: 'Blue to Cyan', value: 'from-blue-500 to-cyan-500'},
          {title: 'Purple to Pink', value: 'from-purple-500 to-pink-500'},
          {title: 'Indigo to Purple', value: 'from-indigo-500 to-purple-500'},
          {title: 'Green to Emerald', value: 'from-green-500 to-emerald-500'},
          {title: 'Orange to Red', value: 'from-orange-500 to-red-500'},
          {title: 'Yellow to Orange', value: 'from-yellow-500 to-orange-500'},
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show in main portfolio section',
      initialValue: true,
    },
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
}
