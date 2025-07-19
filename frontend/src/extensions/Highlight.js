import Highlight from '@tiptap/extension-highlight'

export const CustomHighlight = Highlight.extend({
  addAttributes() {
    return {
      color: {
        default: '#ffff00', // Default bright yellow
        parseHTML: element => element.style.backgroundColor || '#ffff00',
        renderHTML: attributes => {
          if (!attributes.color) {
            return {}
          }
          return {
            style: `background-color: ${attributes.color}; color: inherit !important;`,
          }
        },
      },
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setHighlight: (attributes) => ({ chain }) => {
        return chain().setMark('highlight', attributes).run()
      },
      unsetHighlight: () => ({ chain }) => {
        return chain().unsetMark('highlight').run()
      },
    }
  },

  // Ensure highlight does not override text color
  addGlobalAttributes() {
    return [
      {
        types: ['highlight'],
        attributes: {
          'data-preserve-color': {
            default: 'true',
            parseHTML: () => 'true',
            renderHTML: () => ({
              'data-preserve-color': 'true',
            }),
          },
        },
      },
    ]
  },
}) 