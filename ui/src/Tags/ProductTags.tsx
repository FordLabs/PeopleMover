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
import ProductTagClient from '../ProductTag/ProductTagClient';
import sortTagsAlphabetically from './sortTagsAlphabetically';
import {RoleTag} from '../Roles/RoleTag.interface';
import {createDataTestId} from '../tests/TestUtils';
import ViewTagRow from '../ModalFormComponents/ViewTagRow';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import AddNewTagRow from '../ModalFormComponents/AddNewTagRow';
import {INACTIVE_EDIT_STATE_INDEX, TagAction} from './MyTagsForm';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Space} from '../Space/Space';

interface Props {
    productTags: Array<TagInterface>;
    updateProductTags(Function: (productTags: Array<TagInterface>) => TagInterface[]): void;
    updateFilterOptions(index: number, tag: TagInterface, action: TagAction): void;
    currentSpace: Space;
}

const ProductTags = ({
    productTags,
    updateProductTags,
    currentSpace,
    updateFilterOptions,
}: Props): JSX.Element => {
    const tagType = 'product tag';
    const productTagFilterIndex = 1;
    const [editProductTagIndex, setEditProductTagIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const [isAddingNewTag, setIsAddingNewTag] = useState<boolean>(false);

    const showDeleteConfirmationModal = (productTagToDelete: TagInterface): void => {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: () => deleteProductTag(productTagToDelete),
            close: () => setConfirmDeleteModal(null),
            content: <div>Deleting this product tag will remove it from any product that has been given this product tag.</div>,
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    };

    const returnToViewState = (): void => {
        setEditProductTagIndex(INACTIVE_EDIT_STATE_INDEX);
    };

    const editProductTag = async (productTag: TagRequest): Promise<unknown> => {
        return await ProductTagClient.edit(productTag, currentSpace)
            .then((response) => {
                const newProductTag: TagInterface = response.data;
                updateFilterOptions(productTagFilterIndex, newProductTag, TagAction.EDIT);
                updateProductTags((prevProductTag: Array<TagInterface>) => {
                    const productTags = prevProductTag.map((tag: TagInterface) => tag.id !== productTag.id ? tag : newProductTag);
                    sortTagsAlphabetically(productTags);
                    return productTags;
                });

                returnToViewState();
            });
    };

    const addProductTag = async (productTag: TagRequest): Promise<unknown> => {
        return await ProductTagClient.add(productTag, currentSpace)
            .then((response) => {
                const newProductTag: TagInterface = response.data;
                updateFilterOptions(productTagFilterIndex, newProductTag, TagAction.ADD);
                updateProductTags((prevProductTag: Array<TagInterface>) => {
                    const productTags = [...prevProductTag, newProductTag];
                    sortTagsAlphabetically(productTags);
                    return productTags;
                });

                returnToViewState();
            });
    };

    const deleteProductTag = async (productTagToDelete: TagInterface): Promise<void> => {
        try {
            if (currentSpace.uuid) {
                await ProductTagClient.delete(productTagToDelete.id, currentSpace);
                setConfirmDeleteModal(null);
                updateFilterOptions(productTagFilterIndex, productTagToDelete, TagAction.DELETE);
                updateProductTags((prevProductTags: Array<TagInterface>) =>
                    prevProductTags.filter((productTag: RoleTag) => productTag.id !== productTagToDelete.id)
                );
            }
        } catch {
            return;
        }
    };

    const showEditButtons = (): boolean => editProductTagIndex === INACTIVE_EDIT_STATE_INDEX && !isAddingNewTag;

    const showViewState = (index: number): boolean => editProductTagIndex !== index;

    const showEditState = (index: number): boolean => editProductTagIndex === index;

    return (
        <div data-testid={createDataTestId('tagsModalContainer', tagType)}
            className="myTraitsModalContainer">
            {productTags.map((productTag: TagInterface, index: number) => {
                return (
                    <React.Fragment key={index}>
                        {showViewState(index) &&
                            <ViewTagRow
                                tagType={tagType}
                                tag={productTag}
                                setConfirmDeleteModal={(): void => showDeleteConfirmationModal(productTag)}
                                showEditButtons={showEditButtons()}
                                editTagCallback={(): void => setEditProductTagIndex(index)}
                            />
                        }
                        {showEditState(index) &&
                            <EditTagRow
                                initialValue={productTag}
                                onSave={editProductTag}
                                onCancel={returnToViewState}
                                tagType={tagType}
                                existingTags={productTags}
                            />
                        }
                    </React.Fragment>
                );
            })}
            <AddNewTagRow
                disabled={!showEditButtons()}
                addNewButtonLabel="Product Tag"
                tagType={tagType}
                onSave={addProductTag}
                onAddingTag={setIsAddingNewTag}
                existingTags={productTags}
            />
            {confirmDeleteModal}
        </div>
    );
};

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(ProductTags);
/* eslint-enable */
