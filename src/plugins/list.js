import React from 'react';

/**
 * This is a plugin into the markdown editor to handle lists
 */
function List() {
  const name = 'List';

  const tags = [
    {
      html: 'ul',
      slate: 'ul_list',
      md: node => node.listType === 'bullet'
    },
    {
      html: 'ol',
      slate: 'ol_list',
      md: node => node.listType === 'ordered'
    },
    {
      html: 'li',
      slate: 'list_item',
      md: node => node.type === 'item'
    }
  ];

  /**
   * Augment the base schema with the list types
   * @param {*} schema
   */
  const augmentSchema = ((schema) => {
    const additions = {
      blocks: {
        ol_list: {
          nodes: [{ match: { type: 'list_item' } }],
        },
        ul_list: {
          nodes: [{ match: { type: 'list_item' } }],
        },
        list_item: {
          parent: [{ type: 'ol_list' }, { type: 'ul_list' }],
          nodes: [{ match: [{ object: 'text' }, { type: 'link' }] }],
          marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'code' }],
        },
      },
    };

    const newSchema = JSON.parse(JSON.stringify(schema));
    newSchema.blocks = { ...schema.blocks, ...additions.blocks };
    newSchema.document.nodes[0].match.push({ type: 'ol_list' });
    newSchema.document.nodes[0].match.push({ type: 'ul_list' });
    return newSchema;
  });

  /**
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  const onEnter = (event, editor, next) => next();

  /**
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  const onKeyDown = (event, editor, next) => {
    switch (event.key) {
      case 'Enter':
        return onEnter(event, editor, next);
      default:
        return next();
    }
  };

  /**
   * @param {Object} props
   * @param {Editor} editor
   * @param {Function} next
   */
  const renderBlock = (props, editor, next) => {
    const { node, attributes, children } = props;

    switch (node.type) {
      case 'ol_list':
        return <ol {...attributes}>{children}</ol>;
      case 'ul_list':
        return <ul {...attributes}>{children}</ul>;
      case 'list_item':
        return <li {...attributes}>{children}</li>;
      default:
        return next();
    }
  };

  /**
   * @param {ToMarkdown} parent
   * @param {Node} value
   * @param {Integer} depth
   */
  const toMarkdown = (parent, value, depth) => {
    let markdown = '';
    const listStyleType = (value.type === 'ol_list') ? '1. ' : '* ';
    let indent = '';
    for (let i = 0; i < depth - 1; i += 1) {
      indent += '   ';
    }
    value.nodes.forEach((li) => {
      const text = parent.recursive(li.nodes);
      markdown += `\n${indent}${listStyleType}${text}`;
    });

    return markdown;
  };

  /**
   */
  const fromMarkdown = (stack, event) => {
    let newType = null;
    if (event.node.listType === 'ordered') {
      newType = 'ol_list';
    }
    if (event.node.listType === 'bullet') {
      newType = 'ul_list';
    }
    if (event.node.type === 'item') {
      newType = 'list_item';
    }

    if (event.entering) {
      const block = {
        object: 'block',
        type: newType,
        data: {},
        nodes: [],
      };
      stack.push(block);
    } else {
      stack.pop();
    }

    return true;
  };

  /**
   */
  const fromHTML = (el, next) => {
    if (['ol_list'].includes(el.tagName.toLowerCase())) {
      return {
        object: 'block',
        type: 'ol_list',
        data: { list_type: el.tagName.toLowerCase() },
        nodes: next(el.childNodes),
      };
    }
    if (['ul_list'].includes(el.tagName.toLowerCase())) {
      return {
        object: 'block',
        type: 'ul_list',
        data: { list_type: el.tagName.toLowerCase() },
        nodes: next(el.childNodes),
      };
    }
    return {
      object: 'block',
      type: 'list_item',
      data: {},
      nodes: next(el.childNodes),
    };
  };

  return {
    name,
    tags,
    augmentSchema,
    onKeyDown,
    renderBlock,
    toMarkdown,
    fromMarkdown,
    fromHTML,
  };
}

export default List;
