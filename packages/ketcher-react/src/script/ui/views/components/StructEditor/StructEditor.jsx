/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { Component, createRef } from 'react'
import { ContextMenuTrigger, hideMenu } from 'react-contextmenu'

import Editor from '../../../../editor'
import { FGContextMenu } from '../../../component/ContextMenu/ContextMenu'
import { LoadingCircles } from '../Spinner/LoadingCircles'
import classes from './StructEditor.module.less'
import clsx from 'clsx'
import { upperFirst } from 'lodash/fp'
import handIcon from '../../../../../icons/files/hand.svg'
import compressedHancIcon from '../../../../../icons/files/compressed-hand.svg'
import Cursor from '../Cursor'

// TODO: need to update component after making refactoring of store
function setupEditor(editor, props, oldProps = {}) {
  const { struct, tool, toolOpts, options } = props

  if (struct !== oldProps.struct) editor.struct(struct)

  if (tool !== oldProps.tool || toolOpts !== oldProps.toolOpts) {
    editor.tool(tool, toolOpts)
    if (toolOpts !== oldProps.toolOpts) {
      editor.event.message.dispatch({ info: JSON.stringify(toolOpts) })
    }
  }

  if (oldProps.options && options !== oldProps.options) editor.options(options)

  Object.keys(editor.event).forEach((name) => {
    const eventName = `on${upperFirst(name)}`

    if (props[eventName] !== oldProps[eventName]) {
      if (oldProps[eventName]) editor.event[name].remove(oldProps[eventName])

      if (props[eventName]) editor.event[name].add(props[eventName])
    }
  })
}

function removeEditorHandlers(editor, props) {
  Object.keys(editor.event).forEach((name) => {
    const eventName = `on${upperFirst(name)}`

    if (props[eventName]) editor.event[name].remove(props[eventName])
  })
}

class StructEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      enableCursor: false
    }
    this.editorRef = createRef()
    this.logRef = createRef()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.indigoVerification !== nextProps.indigoVerification ||
      nextState.enableCursor !== this.state.enableCursor
    )
  }

  UNSAFE_componentWillReceiveProps(props) {
    setupEditor(this.editor, props, this.props)
  }

  componentDidMount() {
    this.editor = new Editor(this.editorRef.current, {
      ...this.props.options
    })
    setupEditor(this.editor, this.props)
    if (this.props.onInit) this.props.onInit(this.editor)

    this.editor.event.message.add((msg) => {
      const el = this.logRef.current
      if (msg.info && this.props.showAttachmentPoints) {
        try {
          const parsedInfo = JSON.parse(msg.info)
          el.innerHTML = `Atom Id: ${parsedInfo.atomid}, Bond Id: ${parsedInfo.bondid}`
        } catch {
          el.innerHTML = msg.info
        }
        el.classList.add(classes.visible)
      } else {
        el.classList.remove(classes.visible)
      }
    })

    this.editor.event.cursor.add((csr) => {
      switch (csr.status) {
        case 'enable':
          this.editorRef.current.classList.add(classes.enableCursor)
          const { left, top, right, bottom } =
            this.editorRef.current.getBoundingClientRect()
          const { clientX, clientY } = csr.cursorPosition
          const handShouldBeShown =
            clientX >= left &&
            clientX <= right &&
            clientY >= top &&
            clientX <= bottom
          if (!this.state.enableCursor && handShouldBeShown) {
            this.setState({
              enableCursor: true
            })
          }
          break
        case 'move':
          this.editorRef.current.classList.add(classes.enableCursor)
          this.setState({
            enableCursor: true
          })
          break
        case 'disable':
          this.editorRef.current.classList.remove(classes.enableCursor)
          this.setState({
            enableCursor: false
          })
          break
        case 'leave':
          this.editorRef.current.classList.remove(classes.enableCursor)
          this.setState({
            enableCursor: false
          })
          break
        case 'mouseover':
          this.editorRef.current.classList.add(classes.enableCursor)
          this.setState({
            enableCursor: true
          })
          break
        default:
          break
      }
    })

    this.editor.event.message.dispatch({
      info: JSON.stringify(this.props.toolOpts)
    })
  }

  componentWillUnmount() {
    removeEditorHandlers(this.editor, this.props)
  }

  render() {
    const {
      Tag = 'div',
      struct,
      tool,
      toolOpts,
      options,
      onInit,
      onSelectionChange,
      onElementEdit,
      onEnhancedStereoEdit,
      onQuickEdit,
      onBondEdit,
      onRgroupEdit,
      onSgroupEdit,
      onSdataEdit,
      onRemoveFG,
      onMessage,
      onAromatizeStruct,
      onDearomatizeStruct,
      onAttachEdit,
      indigoVerification,
      onCipChange,
      className,
      onConfirm,
      showAttachmentPoints = true,
      ...props
    } = this.props

    return (
      <Tag
        className={clsx(classes.canvas, className)}
        onMouseDown={(event) => event.preventDefault()}
        {...props}
      >
        <ContextMenuTrigger
          id="contextmenu"
          attributes={{
            onClick: hideMenu
          }}
          holdToDisplay={-1}
        >
          <div
            ref={this.editorRef}
            className={clsx(classes.intermediateCanvas)}
            onMouseDown={(event) => event.preventDefault()}
          >
            {/* svg here */}
          </div>
          <Cursor
            Icon={handIcon}
            PressedIcon={compressedHancIcon}
            enableHandTool={this.state.enableCursor}
          />
          <div className={classes.measureLog} ref={this.logRef} />
          {indigoVerification && (
            <div className={classes.spinnerOverlay}>
              <LoadingCircles />
            </div>
          )}
        </ContextMenuTrigger>
        <FGContextMenu />
      </Tag>
    )
  }
}

export default StructEditor
