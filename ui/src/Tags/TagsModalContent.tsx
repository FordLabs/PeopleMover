/*
 * Copyright (c) 2021 Ford Motor Company
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

import {JSX} from '@babel/types';
import React, {useState} from 'react';
import {TagInterface} from './Tag.interface';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {TagRequest} from './TagRequest.interface';
import {createDataTestId} from '../tests/TestUtils';
import ViewTagRow from '../ModalFormComponents/ViewTagRow';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import AddNewTagRow from '../ModalFormComponents/AddNewTagRow';
import {INACTIVE_EDIT_STATE_INDEX} from './MyTagsForm';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Space} from '../Space/Space';
import {TagClient} from './TagClient.interface';
import {FilterType} from '../SortingAndFiltering/FilterLibraries';

interface Props {
    tags: Array<TagInterface>;
    updateFilterOptions(index: number, tag: TagInterface): void;
    currentSpace: Space;
    tagClient: TagClient;
    filterType: FilterType;
    fetchCommand: () => {};
}

const TagsModalContent = ({
    tags,
    currentSpace,
    updateFilterOptions,
    tagClient,
    filterType,
    fetchCommand,
}: Props): JSX.Element => {
    const [editTagIndex, setEditTagIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const [isAddingNewTag, setIsAddingNewTag] = useState<boolean>(false);

    const showDeleteConfirmationModal = (tagToDelete: TagInterface): void => {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: () => deleteTag(tagToDelete),
            close: () => setConfirmDeleteModal(null),
            content: <div>Deleting this {filterType.tagType} will remove it from anything that has been given
                this {filterType.tagType}.</div>,
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    };

    const returnToViewState = (): void => {
        setEditTagIndex(INACTIVE_EDIT_STATE_INDEX);
    };

    const editTag = async (tagToEdit: TagRequest): Promise<unknown> => {
        return await tagClient.edit(tagToEdit, currentSpace)
            .then((response) => {
                const newTag: TagInterface = response.data;
                updateFilterOptions(filterType.index, newTag);
                fetchCommand();
                returnToViewState();
            });
    };

    const addTag = async (tagToAdd: TagRequest): Promise<unknown> => {
        return await tagClient.add(tagToAdd, currentSpace)
            .then((response) => {
                fetchCommand();
                returnToViewState();
            });
    };

    const deleteTag = async (tagToDelete: TagInterface): Promise<void> => {
        try {
            if (currentSpace.uuid) {
                await tagClient.delete(tagToDelete.id, currentSpace);
                setConfirmDeleteModal(null);
                fetchCommand();
            }
        } catch {
            return;
        }
    };

    const showEditButtons = (): boolean => editTagIndex === INACTIVE_EDIT_STATE_INDEX && !isAddingNewTag;

    const showViewState = (index: number): boolean => editTagIndex !== index;

    const showEditState = (index: number): boolean => editTagIndex === index;

    return (
        <div data-testid={createDataTestId('tagsModalContainer', filterType.tagType)} className="myTraitsModalContainer">
            {tags.map((currentTag: TagInterface, index: number) => {
                return (
                    <React.Fragment key={index}>
                        {showViewState(index) &&
                        <ViewTagRow
                            tagType={filterType.tagType}
                            tag={currentTag}
                            setConfirmDeleteModal={(): void => showDeleteConfirmationModal(currentTag)}
                            showEditButtons={showEditButtons()}
                            editTagCallback={(): void => setEditTagIndex(index)}
                        />
                        }
                        {showEditState(index) &&
                        <EditTagRow
                            initialValue={currentTag}
                            onSave={editTag}
                            onCancel={returnToViewState}
                            tagType={filterType.tagType}
                            existingTags={tags}
                        />
                        }
                    </React.Fragment>
                );
            })}
            <AddNewTagRow
                disabled={!showEditButtons()}
                addNewButtonLabel={filterType.tagNameType}
                tagType={filterType.tagType}
                onSave={addTag}
                onAddingTag={setIsAddingNewTag}
                existingTags={tags}
            />
            {confirmDeleteModal}
        </div>
    );
};

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(TagsModalContent);
/* eslint-enable */
