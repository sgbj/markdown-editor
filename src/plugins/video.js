import React from 'react';
import { Icon } from 'semantic-ui-react';
import styled from 'styled-components';

const StyledIcon = styled(Icon)`
  color: #949CA2 !important;
  position: abosulte;
  width: 24px !important;
  height: 23px !important;
  margin: 6px 0 0 5px !important;
  padding: 3px 0 0 0 !important;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #F0F0F0;
  }
`;

/**
 * A sample plugin that renders a Youtube video using an iframe
 */
function Video() {
  const name = 'video';

  const tags = [
    {
      html: 'video',
      slate: 'video',
      md: 'video'
    }
  ];

  /**
   * Augment the base schema with the video type
   * @param {*} schema
   */
  const augmentSchema = ((schema) => {
    const additions = {
      blocks: {
        video: {
          isVoid: true,
        },
      },
    };

    const newSchema = JSON.parse(JSON.stringify(schema));
    newSchema.blocks = { ...newSchema.blocks, ...additions.blocks };
    newSchema.document.nodes[0].match.push({ type: tags[0].slate });
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
      case 'video':
      {
        let { src } = node.data.get('attributes');
        if (!src) {
          src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        }

        return (<iframe
        {...attributes}
        src={src}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="video"
      >{children}</iframe>);
      }
      default:
        return next();
    }
  };

  /**
     * @param {ToMarkdown} parent
     * @param {Node} value
     * @param {Integer} depth
     */
  const toMarkdown = (parent, value, depth) => `<video ${value.data.get('attributeString')}/>\n\n`;

  /**
     * @param {fromMarkdown} parent
     */
  const fromMarkdown = (stack, event, tag) => {
    const block = {
      object: 'block',
      type: 'video',
      data: Object.assign(tag),
    };

    stack.push(block);
    stack.pop();
    return true;
  };

  /**
     * @param {fromHTML} parent
     */
  const fromHTML = (editor, el, next) => ({
    object: 'block',
    type: 'video',
    data: {},
    nodes: next(el.childNodes),
  });

  /**
   * When then button is clicked
   *
   * @param {Editor} editor
   * @param {Event} event
   */
  const onClickButton = (editor, event) => {
    event.preventDefault();
    alert('Video plugin button clicked!');
  };

  /**
   * Render a video toolbar button.
   *
   * @param {Editor} editor
   * @return {Element}
   */
  const renderToolbar = editor => (<StyledIcon
      key={name}
      name='youtube'
      aria-label='youtube'
      className='toolbar-2x4'
      onMouseDown={event => onClickButton(editor, event)}
    />);

  return {
    name,
    tags,
    augmentSchema,
    onKeyDown,
    renderBlock,
    toMarkdown,
    fromMarkdown,
    fromHTML,
    renderToolbar
  };
}

export default Video;
