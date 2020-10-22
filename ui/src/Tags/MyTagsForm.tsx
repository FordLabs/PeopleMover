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

import React, {useEffect, useState} from 'react';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptions} from '../Redux/Actions';
import warningIcon from '../Application/Assets/warningIcon.svg';
import LocationClient from '../Locations/LocationClient';
import TagRowsContainer from '../ModalFormComponents/TagRowsContainer';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import ViewTagRow from '../ModalFormComponents/ViewTagRow';
import {Tag} from './Tag';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {Space} from '../Space/Space';
import ViewTagRow from "../ModalFormComponents/ViewTagRow";

import '../ModalFormComponents/TagRowsContainer.scss';
import ProductTagClient from '../ProductTag/ProductTagClient';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {JSX} from '@babel/types';
import RoleClient from '../Roles/RoleClient';
import {SpaceRole} from '../Roles/Role';
import {FilterOption} from '../CommonTypes/Option';

const INACTIVE_EDIT_STATE_INDEX = -1;

enum TagAction {
    ADD,
    EDIT,
    DELETE
}

interface Props {
    currentSpace: Space;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function MyTagsForm({ currentSpace, allGroupedTagFilterOptions }: Props): JSX.Element {

    function sortTraitsAlphabetically(traitsList: Array<Tag>): void {
        traitsList.sort( (trait1: Tag, trait2: Tag) => {
            return trait1.name.toLowerCase().localeCompare(trait2.name.toLowerCase());
        });
    }

    // @todo abstract away to redux please
    const updateFilterValuesInGroupedTags = (index: number, trait: Tag, action: TagAction): Array<FilterOption> => {
        let options: Array<FilterOption>;
        switch (action) {
            case TagAction.ADD:
                options = [
                    ...allGroupedTagFilterOptions[index].options,
                    {label: trait.name, value: trait.id.toString() + '_' + trait.name, selected: false},
                ];
                break;
            case TagAction.EDIT:
                options = allGroupedTagFilterOptions[index].options.map(val =>
                    !val.value.includes(trait.id.toString() + '_') ?
                        val :
                        {
                            label: trait.name,
                            value: trait.id.toString() + '_' + trait.name,
                            selected: val.selected,
                        }
                );
                break;
            case TagAction.DELETE:
                options = allGroupedTagFilterOptions[index].options.filter(val => val.label !== trait.name);
                break;
            default:
                options = [];
        }
        return options;
    };

    const LocationTags = (): JSX.Element => {
        const [locations, setLocations] = useState<Array<Tag>>([]);
        const [editLocationIndex, setEditLocationIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
        const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

        function sortTraitsAlphabetically(traitsList: Array<Tag>): void {
            traitsList.sort( (trait1: Tag, trait2: Tag) => {
                return trait1.name.toLowerCase().localeCompare(trait2.name.toLowerCase());
            });
        }

        useEffect(() => {
            async function setup(): Promise<void> {
                const response = await LocationClient.get(currentSpace.uuid!!);
                sortTraitsAlphabetically(response.data);
                setLocations(response.data);
            }

            setup().then();
        }, [currentSpace.uuid]);

        // @todo refactor
        function updateLocationFilterOptions(role: Tag, action: TagAction ): void {
            const groupedFilterOptions = [...allGroupedTagFilterOptions];
            const locationFilterIndex = 0;
            groupedFilterOptions[locationFilterIndex]
                .options = updateFilterValuesInGroupedTags(locationFilterIndex, role, action);
            setAllGroupedTagFilterOptions(groupedFilterOptions);
        }

        const deleteLocation = async (roleToDelete: Tag): Promise<void> => {
            try {
                if (currentSpace.uuid) {
                    await LocationClient.delete(roleToDelete.id, currentSpace.uuid);
                    setConfirmDeleteModal(null);
                    setLocations(prevTraits => prevTraits.filter((location: SpaceRole) => location.id !== roleToDelete.id));
                    updateLocationFilterOptions(roleToDelete, TagAction.DELETE);
                }
            } catch {
                return;
            }
        };

        const showDeleteConfirmationModal = (roleToDelete: Tag): void => {
            const propsForDeleteConfirmationModal: ConfirmationModalProps = {
                submit: () => deleteLocation(roleToDelete),
                close: () => setConfirmDeleteModal(null),
                warningMessage: `Deleting this product tag will remove it from any product that has been given this product tag.`,
            };
            const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
            setConfirmDeleteModal(deleteConfirmationModal);
        };

        const onSave = (location: Tag): void => {
            // edit location
        };

        const onChange = (location: Tag): void => {
            // update input value
        };

        return (
            <TagRowsContainer
                addNewButtonLabel="Location"
                confirmDeleteModal={confirmDeleteModal}
            >
                <div className="title">Location Tags</div>
                {locations.map((location: Tag, index: number) => {
                    return (
                        <React.Fragment key={index}>
                            {editLocationIndex != index &&
                            <ViewTagRow
                                tag={location}
                                index={index}
                                setConfirmDeleteModal={(): void => showDeleteConfirmationModal(location)}
                                showEditButtons={editLocationIndex === INACTIVE_EDIT_STATE_INDEX}
                                editTagCallback={(): void => setEditLocationIndex(index)}
                            />
                            }
                            {editLocationIndex === index &&
                               <EditTagRow
                                   onChange={(): void => onChange(location)}
                                   onSave={(): void => onSave(location)}

                                   closeCallback={(): void => toggleEditSection(index)}
                                   updateCallback={updateTraits}
                                   trait={location}
                                   colorSection={colorSection}
                                   traitClient={traitClient}
                                   traitName={traitName}
                                   currentSpace={currentSpace}
                                   listOfTraits={locations}
                               />
                            }
                        </React.Fragment>
                    );
                })}
            </TagRowsContainer>
        );
    };

    const ProductTags = (): JSX.Element => {
        const [productTags, setProductTags] = useState<Array<Tag>>([]);
        const [editProductTagIndex, setEditProductTagIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);
        const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);

        useEffect(() => {
            async function setup(): Promise<void> {
                const response = await ProductTagClient.get(currentSpace.uuid!!);
                sortTraitsAlphabetically(response.data);
                setProductTags(response.data);
            }

            setup().then();
        }, [currentSpace.uuid]);

        // @todo refactor
        function updateProductTagFilterOptions(productTag: Tag, action: TagAction ): void {
            const groupedFilterOptions = [...allGroupedTagFilterOptions];
            const productTagFilterIndex = 1;
            groupedFilterOptions[productTagFilterIndex]
                .options = updateFilterValuesInGroupedTags(productTagFilterIndex, productTag, action);
            setAllGroupedTagFilterOptions(groupedFilterOptions);
        }

        const deleteProductTag = async (productTagToDelete: Tag): Promise<void> => {
            try {
                if (currentSpace.uuid) {
                    await ProductTagClient.delete(productTagToDelete.id, currentSpace.uuid);
                    setConfirmDeleteModal(null);
                    setProductTags(prevTraits =>
                        prevTraits.filter((productTag: SpaceRole) => productTag.id !== productTagToDelete.id)
                    );
                    updateProductTagFilterOptions(productTagToDelete, TagAction.DELETE);
                }
            } catch {
                return;
            }
        };

        const showDeleteConfirmationModal = (productTagToDelete: Tag): void => {
            const propsForDeleteConfirmationModal: ConfirmationModalProps = {
                submit: () => deleteProductTag(productTagToDelete),
                close: () => setConfirmDeleteModal(null),
                warningMessage: `Deleting this product tag will remove it from any product that has been given this product tag.`,
            };
            const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
            setConfirmDeleteModal(deleteConfirmationModal);
        };

        const onSave = (productTag: Tag): void => {
            // edit productTag
        };

        const onChange = (productTag: Tag): void => {
            // update input value
        };

        return (
            <TagRowsContainer
                addNewButtonLabel="Product Tag"
                confirmDeleteModal={confirmDeleteModal} >
                <div className="title">Product Tags</div>
                {productTags.map((productTag: Tag, index: number) => {
                    return (
                        <React.Fragment key={index}>
                            {editProductTagIndex != index &&
                                <ViewTagRow
                                    tag={productTag}
                                    index={index}
                                    setConfirmDeleteModal={(): void => showDeleteConfirmationModal(productTag)}
                                    showEditButtons={editProductTagIndex === INACTIVE_EDIT_STATE_INDEX}
                                    editTagCallback={(): void => setEditProductTagIndex(index)}
                                />
                            }
                            {editProductTagIndex === index &&
                                <EditTagRow
                                    onChange={(): void => onChange(productTag)}
                                    onSave={(): void => onSave(productTag)}

                                    closeCallback={(): void => toggleEditSection(index)}
                                    updateCallback={updateTraits}
                                    trait={productTag}
                                    colorSection={colorSection}
                                    traitClient={traitClient}
                                    traitName={traitName}
                                    currentSpace={currentSpace}
                                />
                            }
                        </React.Fragment>
                    );
                })}
            </TagRowsContainer>
        );
    };

    return (
        <div data-testid="myTagsModal" className="myTraitsContainer">
            <LocationTags />
            <div className="lineSeparator"/>
            <ProductTags />
            <div className="traitWarning">
                <img src={warningIcon} className="warningIcon" alt="warning icon"/>
                <p className="warningText">
                    Editing or deleting a tag will affect any product currently tagged with it.
                </p>
            </div>
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptions(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyTagsForm);
/* eslint-enable */
