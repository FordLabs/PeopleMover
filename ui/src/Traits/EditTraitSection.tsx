/*
 * Copyright (c) 2020 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Color, SpaceRole} from '../Roles/Role';
import React, {createRef, RefObject, useEffect, useState} from 'react';
import ColorClient from '../Roles/ColorClient';
import '../Traits/MyTraits.scss';
import {AxiosResponse} from 'axios';
import {Trait} from './Trait';
import {TraitAddRequest} from './TraitAddRequest';
import {TraitClient} from './TraitClient';
import {TraitEditRequest} from './TraitEditRequest';
import {RoleAddRequest} from '../Roles/RoleAddRequest';
import {RoleEditRequest} from '../Roles/RoleEditRequest';
import {Space} from '../Space/Space';
import SaveIcon from './saveIcon.png';
import CloseIcon from './closeIcon.png';

interface EditTraitSectionProps {
    closeCallback: () => void;
    updateCallback: (newRole: Trait) => void;
    trait?: Trait;
    colorSection: boolean;
    traitClient: TraitClient;
    traitName: string;
    currentSpace: Space;
}

function EditTraitSection({
    closeCallback,
    updateCallback,
    trait,
    colorSection,
    traitClient,
    traitName,
    currentSpace,
}: EditTraitSectionProps): JSX.Element {
    const [colors, setColors] = useState<Array<Color>>([]);
    const [enteredTrait, setEnteredTrait] = useState<TraitAddRequest>();
    const [duplicateErrorMessage, setDuplicateErrorMessage] = useState<boolean>(false);
    const colorRefs: Array<RefObject<HTMLSpanElement>> = [];

    useEffect(() => {
        let mounted = false;
        async function setColorsAndTraits(): Promise<void> {
            if (colorSection) {
                ColorClient.getAllColors().then(response => {
                    if (mounted) {
                        const colors: Array<Color> = response.data;
                        setColors(colors);

                        const spaceRole: SpaceRole = trait as SpaceRole;
                        const roleAddRequest: RoleAddRequest = {
                            name: spaceRole ? spaceRole.name : '',
                            colorId: spaceRole && spaceRole.color ? spaceRole.color.id : colors[colors.length - 1].id,
                        };
                        setEnteredTrait(roleAddRequest);
                    }
                });
            } else {
                const traitAddRequest: TraitAddRequest = {
                    name: trait ? trait.name : '',
                };
                setEnteredTrait(traitAddRequest);
            }
        }

        mounted = true;
        setColorsAndTraits().then();
        return (): void => {mounted = false;};
    }, [colorSection, trait]);

    function highlightCircle(circleRef: RefObject<HTMLSpanElement>, color: Color): void {
        clearHighlightedCircle();
        if (circleRef.current) {
            circleRef.current.classList.add('highlightedCircle');
        }

        setEnteredTrait(prevEnteredTrait => ({
            ...prevEnteredTrait,
            colorId: color.id,
        }));
    }

    function clearHighlightedCircle(): void {
        colorRefs.forEach(colorRef => {
            if (colorRef.current) {
                colorRef.current.classList.remove('highlightedCircle');
            }
        });
    }

    function handleEnterSubmit(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            handleSubmit().then();
        }
    }

    async function handleSubmit(): Promise<void> {
        setDuplicateErrorMessage(false);
        if (enteredTrait && enteredTrait.name !== '') {
            let clientResponse: AxiosResponse;
            try {
                if (trait) {
                    let editRequest: TraitEditRequest = {
                        id: trait.id,
                        updatedName: enteredTrait.name,
                    };
                    if (colorSection) {
                        editRequest = {
                            ...editRequest,
                            updatedColorId: (enteredTrait as RoleAddRequest).colorId,
                        } as RoleEditRequest;
                    }
                    clientResponse = await traitClient.edit(editRequest, currentSpace.uuid!!);
                } else {
                    clientResponse = await traitClient.add(enteredTrait, currentSpace.uuid!!);
                }
            } catch (error) {
                if (error.response.status === 409) {
                    setDuplicateErrorMessage(true);
                }
                return;
            }
            const newTrait: Trait = clientResponse.data;
            updateCallback(newTrait);
            closeCallback();
        }
    }

    function updateEnteredRoleText(event: React.ChangeEvent<HTMLInputElement>): void {
        const input: string = event.target ? event.target.value : '';
        setEnteredTrait(prevEnteredTrait => ({
            ...prevEnteredTrait,
            name: input,
        }));
    }

    function highlightDefaultCircle(color: Color, index: number): string {
        const spaceRole: SpaceRole = trait as SpaceRole;
        const thisColorCircleMatchesProvidedColor = spaceRole && spaceRole.color && spaceRole.color.color === color.color;
        const thisColorCircleIsWhiteOne = !spaceRole && (colors.length - 1) === index;

        if (thisColorCircleMatchesProvidedColor || thisColorCircleIsWhiteOne) {
            return 'highlightedCircle';
        }
        return '';
    }

    function putBorderOnWhiteCircle(index: number): string {
        return (colors.length - 1) === index ? 'whiteCircleBorder' : '';
    }

    function handleKeyDownForHighlightCircle(event: React.KeyboardEvent, ref: React.RefObject<HTMLSpanElement>, color: Color): void {
        if (event.key === 'Enter') {
            highlightCircle(ref, color);
        }
    }

    return (
        <>
            <div className="traitRow">
                <input className="editTagInput"
                    data-testid="tagNameInput"
                    type="text"
                    value={enteredTrait ? enteredTrait.name : ''}
                    onChange={updateEnteredRoleText}
                    onKeyPress={(e): void => handleEnterSubmit(e)}/>
                <div className="traitEditIcons">
                    <button onClick={closeCallback}
                        data-testid="cancelTagButton"
                        className="closeEditTagButton"
                        aria-label="Close Edited Tag">
                        <img src={CloseIcon} alt=""/>
                    </button>
                    <button disabled={enteredTrait ? enteredTrait.name === '' : true}
                        onClick={handleSubmit}
                        data-testid="saveTagButton"
                        className="saveEditTagButton"
                        aria-label="Save Edited Tag">
                        <img src={SaveIcon} alt=""/>
                    </button>
                </div>
            </div>
            {colorSection && (
                <div className="selectRoleCircles">
                    {colors.map((color: Color, index: number) => {
                        const ref: RefObject<HTMLSpanElement> = createRef();
                        colorRefs.push(ref);

                        return (
                            <span key={index}
                                ref={ref}
                                data-testid="selectRoleCircle"
                                style={{'backgroundColor': color.color}}
                                onClick={(): void => highlightCircle(ref, color)}
                                onKeyDown={(e): void => handleKeyDownForHighlightCircle(e, ref, color)}
                                className={`myTraitsCircle selectRoleCircle ${highlightDefaultCircle(color, index)} ${putBorderOnWhiteCircle(index)}`}/>
                        );
                    })}
                </div>
            )}
            {duplicateErrorMessage && (
                <div className="duplicateErrorMessage">
                    A {traitName} with this name already exists. Enter a different name.
                </div>
            )}
        </>
    );
}

export default EditTraitSection;
