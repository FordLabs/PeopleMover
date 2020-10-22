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
import React, {ChangeEvent, ReactNode, useEffect, useState} from 'react';
import ColorClient from '../Roles/ColorClient';
import {AxiosResponse} from 'axios';
import {Tag} from '../Tags/Tag';
import {TagAddRequest} from '../Tags/TagAddRequest';
import {TagClient} from '../Tags/TagClient';
import {TagEditRequest} from '../Tags/TagEditRequest';
import {TraitNameType} from './TagRowsContainer';
import Select, {OptionType} from '../ModalFormComponents/Select';
import ColorCircle from '../ModalFormComponents/ColorCircle';
import {RoleAddRequest} from '../Roles/RoleAddRequest';
import {RoleEditRequest} from '../Roles/RoleEditRequest';
import {Space} from '../Space/Space';
import SaveIcon from '../Application/Assets/saveIcon.png';
import CloseIcon from '../Application/Assets/closeIcon.png';
import {JSX} from '@babel/types';
import {createDataTestId} from '../tests/TestUtils';

import './TagRowsContainer.scss';

interface EditTraitSectionProps {
    colorDropdownComponent?: ReactNode;
    tagInputValue: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;

    closeCallback: () => void;
    updateCallback: (newRole: Tag) => void;
    trait?: Tag;
    colorSection: boolean;
    traitClient: TagClient;
    traitName: TraitNameType;
    currentSpace: Space;
}

function EditTagRow({
    colorDropdownComponent,
    tagInputValue = '',
    onChange,
    onSave,

    closeCallback,
    updateCallback,
    trait,
    colorSection,
    traitClient,
    traitName,
    currentSpace,
}: EditTraitSectionProps): JSX.Element {
    // const [tagInputValue, setTagInputValue] = useState<string>('');
    const [duplicateErrorMessage, setDuplicateErrorMessage] = useState<boolean>(false);
    const traitNameClass = traitName.replace(' ', '_');

    useEffect(() => {
        let mounted = false;
        async function setColorsAndTraits(): Promise<void> {
            // if (colorSection) {
            //     ColorClient.getAllColors().then(response => {
            //         if (mounted) {
            //             const colors: Array<Color> = response.data;
            //             setColors(colors);
            //
            //             const spaceRole: SpaceRole = trait as SpaceRole;
            //
            //             const roleColor = spaceRole && spaceRole.color ? spaceRole.color : colors[colors.length - 1];
            //             const roleAddRequest: RoleAddRequest = {
            //                 name: spaceRole ? spaceRole.name : '',
            //                 colorId: roleColor.id,
            //             };
            //             setSelectedColor(roleColor);
            //             setEnteredTrait(roleAddRequest);
            //         }
            //     });
            // } else {
            const traitAddRequest: TagAddRequest = {
                name: trait ? trait.name : '',
            };
            setTagInputValue(traitAddRequest);
            // }
        }

        mounted = true;
        setColorsAndTraits().then();
        return (): void => {mounted = false;};
    }, [colorSection, trait]);

    function handleEnterSubmit(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            onSave();
        }
    }


    // @TODO FIX THIS NOW
    async function handleSubmit(): Promise<void> {
        setDuplicateErrorMessage(false);
        if (tagInputValue && tagInputValue.name !== '') {
            let clientResponse: AxiosResponse;
            try {
                if (trait) {
                    let editRequest: TagEditRequest = {
                        id: trait.id,
                        updatedName: tagInputValue.name,
                    };
                    if (colorSection) {
                        editRequest = {
                            ...editRequest,
                            updatedColorId: (tagInputValue as RoleAddRequest).colorId,
                        } as RoleEditRequest;
                    }
                    clientResponse = await traitClient.edit(editRequest, currentSpace.uuid!!);
                } else {
                    clientResponse = await traitClient.add(tagInputValue, currentSpace.uuid!!);
                }
            } catch (error) {
                if (error.response.status === 409) {
                    setDuplicateErrorMessage(true);
                }
                return;
            }
            const newTrait: Tag = clientResponse.data;
            updateCallback(newTrait);
            closeCallback();
        }
    }

    function updateEnteredRoleText(event: React.ChangeEvent<HTMLInputElement>): void {
        const input: string = event.target ? event.target.value : '';
        setTagInputValue(prevEnteredTrait => ({
            ...prevEnteredTrait,
            name: input,
        }));
    }

    return (
        <>
            <div className={`editTagRow ${traitNameClass}`} data-testid={createDataTestId('editTagRow', traitName)}>
                {colorDropdownComponent}
                <input className={`editTagInput ${traitNameClass}`}
                    data-testid="tagNameInput"
                    type="text"
                    value={tagInputValue}
                    onChange={onChange}
                    onKeyPress={handleEnterSubmit}/>
                <div className="traitEditIcons">
                    <button onClick={closeCallback}
                        data-testid="cancelTagButton"
                        className="closeEditTagButton"
                        aria-label="Close Edited Tag">
                        <img src={CloseIcon} alt=""/>
                    </button>
                    <button disabled={!tagInputValue}
                        onClick={onSave}
                        data-testid="saveTagButton"
                        className="saveEditTagButton"
                        aria-label="Save Edited Tag">
                        <img src={SaveIcon} alt=""/>
                    </button>
                </div>
            </div>
            {duplicateErrorMessage && (
                <div className="duplicateErrorMessage">
                    A {traitName} with this name already exists. Enter a different name.
                </div>
            )}
        </>
    );
}

export default EditTagRow;
