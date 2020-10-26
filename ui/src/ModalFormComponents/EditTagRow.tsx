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

import React, {ChangeEvent, ReactNode, useState} from 'react';
import SaveIcon from '../Application/Assets/saveIcon.png';
import CloseIcon from '../Application/Assets/closeIcon.png';
import {JSX} from '@babel/types';
import {createDataTestId} from '../tests/TestUtils';
import {TagNameType, TagType} from './TagForms.types';
import {TagRequest} from '../Tags/TagRequest.interface';

import './TagRowsContainer.scss';

interface Props {
    colorDropdown?: ReactNode;
    initialValue?: TagRequest;
    onSave: (value: TagRequest) => Promise<unknown>;
    onCancel: () => void;
    tagName: TagNameType;
    testIdSuffix: TagType;
}

function EditTagRow({
    colorDropdown,
    tagName,
    initialValue = { name: '' },
    testIdSuffix,
    onSave,
    onCancel,
}: Props): JSX.Element {
    const traitNameClass = testIdSuffix.replace(' ', '_');
    const [tagInputValue, setTagInputValue] = useState<TagRequest>(initialValue);
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);

    // useEffect(() => {
    //     let mounted = false;
    //     async function setColorsAndTraits(): Promise<void> {
    //         // if (colorSection) {
    //         //     ColorClient.getAllColors().then(response => {
    //         //         if (mounted) {
    //         //             const colors: Array<Color> = response.data;
    //         //             setColors(colors);
    //         //
    //         //             const spaceRole: SpaceRole = trait as SpaceRole;
    //         //
    //         //             const roleColor = spaceRole && spaceRole.color ? spaceRole.color : colors[colors.length - 1];
    //         //             const roleAddRequest: RoleAddRequest = {
    //         //                 name: spaceRole ? spaceRole.name : '',
    //         //                 colorId: roleColor.id,
    //         //             };
    //         //             setSelectedColor(roleColor);
    //         //             setEnteredTrait(roleAddRequest);
    //         //         }
    //         //     });
    //         // } else {
    //         const traitAddRequest: TagAddRequestInterface = {
    //             name: trait ? trait.name : '',
    //         };
    //         setTagInputValue(traitAddRequest);
    //         // }
    //     }

    //     mounted = true;
    //     setColorsAndTraits().then();
    //     return (): void => {mounted = false;};
    // }, [colorSection, trait]);

    // @TODO FIX THIS NOW
    // async function handleSubmit(): Promise<void> {
    //     setDuplicateErrorMessage(false);
    //     if (tagInputValue && tagInputValue.name !== '') {
    //         let clientResponse: AxiosResponse;
    //         try {
    //             if (trait) {
    //                 let editRequest: TagEditRequestInterface = {
    //                     id: trait.id,
    //                     updatedName: tagInputValue.name,
    //                 };
    //                 if (colorSection) {
    //                     editRequest = {
    //                         ...editRequest,
    //                         updatedColorId: (tagInputValue as RoleAddRequest).colorId,
    //                     } as RoleEditRequest;
    //                 }
    //                 clientResponse = await traitClient.edit(editRequest, currentSpace.uuid!!);
    //             } else {
    //                 clientResponse = await traitClient.add(tagInputValue, currentSpace.uuid!!);
    //             }
    //         } catch (error) {
    //             if (error.response.status === 409) {
    //                 setDuplicateErrorMessage(true);
    //             }
    //             return;
    //         }
    //         const newTrait: Tag = clientResponse.data;
    //         updateCallback(newTrait);
    //         closeCallback();
    //     }
    // }

    // function updateEnteredRoleText(event: React.ChangeEvent<HTMLInputElement>): void {
    //     const input: string = event.target ? event.target.value : '';
    //     setTagInputValue(prevEnteredTrait => ({
    //         ...prevEnteredTrait,
    //         name: input,
    //     }));
    // }

    const saveTag = (tagValue: TagRequest): void => {
        onSave(tagValue).catch((error) => {
            if (error.response.status === 409) {
                setShowErrorMessage(true);
            }
        });
    };

    const handleEnterSubmit = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') {
            saveTag(tagInputValue);
        }
    };

    const handleOnChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const newInputValue = event.target.value;
        setTagInputValue({
            id: initialValue.id,
            name: newInputValue,
        });
    };

    return (
        <>
            <div className={`editTagRow ${traitNameClass}`}
                data-testid={createDataTestId('editTagRow', testIdSuffix)}>
                {colorDropdown}
                <input className={`editTagInput ${traitNameClass}`}
                    data-testid="tagNameInput"
                    type="text"
                    value={tagInputValue.name}
                    onChange={handleOnChange}
                    onKeyPress={handleEnterSubmit}/>
                <div className="traitEditIcons">
                    <button onClick={onCancel}
                        data-testid="cancelTagButton"
                        className="closeEditTagButton"
                        aria-label="Close Edited Tag">
                        <img src={CloseIcon} alt=""/>
                    </button>
                    <button disabled={!tagInputValue}
                        onClick={(): void => saveTag(tagInputValue)}
                        data-testid="saveTagButton"
                        className="saveEditTagButton"
                        aria-label="Save Edited Tag">
                        <img src={SaveIcon} alt=""/>
                    </button>
                </div>
            </div>
            {showErrorMessage && (
                <div className="duplicateErrorMessage">
                    A {tagName} with this name already exists. Enter a different name.
                </div>
            )}
        </>
    );
}

export default EditTagRow;
