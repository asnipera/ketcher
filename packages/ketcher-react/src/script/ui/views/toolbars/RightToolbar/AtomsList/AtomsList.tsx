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

import { ElementColor, Elements } from 'ketcher-core'
import { atomCuts, basicAtoms } from '../../../../action/atoms'

import Atom from '../../../../component/view/Atom'
import { UiActionAction } from '../../../../action'
import { forwardRef } from 'react'
import { shortcutStr } from '../../shortcutStr'
import styled from '@emotion/styled'
import α from 'color-alpha'

interface AtomsListProps {
  atoms: string[]
  active?: {
    tool?: string
    opts: {
      label: string
    }
  }
}

interface AtomsListCallProps {
  onAction: (action: UiActionAction) => void
}

type Props = AtomsListProps & AtomsListCallProps

const StyledAtomList = styled.div((props: any) => {
  const atomColor = props?.children?.key
    ? ElementColor[props.children.key]
    : '#000'
  return `
    ${Atom} > button {
       color: ${atomColor};
       border: 1px solid ${atomColor};
       &:hover {
         background-color: ${α(atomColor, 0.2)};
       }
       &:active {
         color: #fff;
         background-color: ${α(atomColor, 0.8)};
       }
       &.selected {
         color: #fff;
         background-color: ${α(atomColor, 0.8)};
  
         &:hover {
           background-color: ${atomColor};
         }
       }
     }
   `
})

const AtomsList = forwardRef<HTMLDivElement, Props>((props: Props, ref) => {
  const { atoms, active, onAction } = props
  const isAtom = active && active.tool === 'atom'

  return (
    <>
      {atoms.map((label) => {
        const element = Elements.get(label)
        const shortcut =
          basicAtoms.indexOf(label) > -1 ? shortcutStr(atomCuts[label]) : null
        return (
          <StyledAtomList key={label} ref={ref}>
            <Atom
              key={label}
              el={element}
              shortcut={shortcut}
              selected={isAtom && active && active.opts.label === label}
              onClick={() => onAction({ tool: 'atom', opts: { label } })}
            />
          </StyledAtomList>
        )
      })}
    </>
  )
})

export type { AtomsListProps, AtomsListCallProps }
export { AtomsList }
