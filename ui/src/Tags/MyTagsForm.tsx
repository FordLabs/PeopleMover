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

import React from 'react';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {
    fetchLocationsAction,
    fetchPersonTagsAction,
    fetchProductTagsAction,
    setAllGroupedTagFilterOptionsAction,
} from '../Redux/Actions';
import {TagInterface} from './Tag.interface';
import {JSX} from '@babel/types';
import {FilterOption} from '../CommonTypes/Option';
import {LocationTag} from '../Locations/LocationTag.interface';
import {Tag} from './Tag';
import TagsModalContent from './TagsModalContent';

import '../ModalFormComponents/TagRowsContainer.scss';
import {AllGroupedTagFilterOptions, FilterType, FilterTypeListings} from '../SortingAndFiltering/FilterLibraries';
import ProductTagClient from './ProductTag/ProductTagClient';
import LocationClient from '../Locations/LocationClient';
import PersonTagClient from './PersonTag/PersonTagClient';

export const INACTIVE_EDIT_STATE_INDEX = -1;

interface Props {
    filterType: FilterType;
    locations: Array<LocationTag>;
    productTags: Array<Tag>;
    personTags: Array<Tag>;
    fetchLocations(): Array<LocationTag>;
    fetchProductTags(): Array<Tag>;
    fetchPersonTags(): Array<Tag>;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    locations: state.locations,
    productTags: state.productTags,
    personTags: state.personTags,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchLocations: () => dispatch(fetchLocationsAction()),
    fetchPersonTags: () => dispatch(fetchPersonTagsAction()),
    fetchProductTags: () => dispatch(fetchProductTagsAction()),
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyTagsForm);
/* eslint-enable */

function MyTagsForm({
    filterType,
    locations,
    productTags,
    personTags,
    fetchLocations,
    fetchProductTags,
    fetchPersonTags,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
}: Props): JSX.Element {

    const getUpdatedFilterOptions = (index: number, tag: TagInterface): Array<FilterOption> => {
        let options: Array<FilterOption>;
        options = allGroupedTagFilterOptions[index].options.map(val =>
            !val.value.includes(tag.id.toString() + '_') ?
                val :
                {
                    label: tag.name,
                    value: tag.id.toString() + '_' + tag.name,
                    selected: val.selected,
                }
        );
        return options;
    };

    function updateFilterOptions(optionIndex: number, tag: TagInterface): void {
        const groupedFilterOptions = [...allGroupedTagFilterOptions];
        groupedFilterOptions[optionIndex]
            .options = getUpdatedFilterOptions(optionIndex, tag);
        setAllGroupedTagFilterOptions(groupedFilterOptions);
    }

    const getWarningMessageElement = (message: string): JSX.Element => {
        return <div className="traitWarning">
            <i className="material-icons warningIcon">error</i>
            <p className="warningText">
                {message}
            </p>
        </div>;
    };

    return (
        <div data-testid="myTagsModal" className="myTraitsContainer">
            {filterType === FilterTypeListings.Location &&
            <>
                <TagsModalContent
                    tags={locations}
                    updateFilterOptions={updateFilterOptions}
                    tagClient={LocationClient}
                    filterType={filterType}
                    fetchCommand={fetchLocations}
                />
                {getWarningMessageElement('Editing or deleting a tag will affect any product currently tagged with it.')}
            </>
            }
            {filterType === FilterTypeListings.ProductTag &&
            <>
                <TagsModalContent
                    tags={productTags}
                    updateFilterOptions={updateFilterOptions}
                    tagClient={ProductTagClient}
                    filterType={filterType}
                    fetchCommand={fetchProductTags}
                />
                {getWarningMessageElement('Editing or deleting a tag will affect any product currently tagged with it.')}
            </>
            }
            {filterType === FilterTypeListings.PersonTag &&
            <>
                <TagsModalContent
                    tags={personTags}
                    updateFilterOptions={updateFilterOptions}
                    tagClient={PersonTagClient}
                    filterType={filterType}
                    fetchCommand={fetchPersonTags}
                />
                {getWarningMessageElement('Editing or deleting a tag will affect any person currently tagged with it.')}
            </>
            }
        </div>
    );
}
