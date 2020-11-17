import {JSX} from '@babel/types';
import {connect} from 'react-redux';
import {Option} from '../CommonTypes/Option';
import LocationClient from '../Locations/LocationClient';
import {AxiosResponse} from 'axios';
import {LocationTag} from '../Locations/LocationTag.interface';
import {Tag} from '../Tags/Tag.interface';
import Creatable from 'react-select/creatable';
import {CreateNewText, CustomIndicator, CustomOption} from '../ReusableComponents/ReactSelectStyles';
import React, {useEffect, useState} from 'react';
import {Product} from './Product';
import {Space} from '../Space/Space';
import {GlobalStateProps} from '../Redux/Reducers';
import {customStyles} from './ProductForm';
import {TagRequest} from '../Tags/TagRequest.interface';

interface Props {
    loadingState: { isLoading: boolean; setIsLoading: (isLoading: boolean) => void };
    currentProductState: { currentProduct: Product; setCurrentProduct: (updatedProduct: Product) => void };
    spaceId: number;
    addGroupedTagFilterOptions: (tagFilterIndex: number, trait: Tag) => void;
    currentSpace: Space;
}

function ProductFormLocationField({
    spaceId,
    loadingState: {
        isLoading,
        setIsLoading,
    },
    currentProductState: {
        currentProduct,
        setCurrentProduct,
    },
    currentSpace,
    addGroupedTagFilterOptions,
}: Props): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const uuid = currentSpace.uuid!;
    const [availableLocations, setAvailableLocations] = useState<LocationTag[]>([]);
    const [typedInLocation, setTypedInLocation] = useState<string>('');

    useEffect(() => {
        LocationClient.get(uuid)
            .then(result => {
                setAvailableLocations(result.data);
            });
    }, [uuid]);

    function optionToSpaceLocation(option: Option): LocationTag {
        return {
            id: Number.parseInt(option.value.split('_')[0], 10),
            name: option.label,
            spaceId,
        };
    }

    function createLocationOption(location: LocationTag): Option {
        return {
            label: location.name,
            value: location.id ? location.id.toString() : '',
        };
    }

    function locationOptionValue(): Option | undefined {
        if (currentProduct.spaceLocation && currentProduct.spaceLocation.name !== '') {
            return createLocationOption(currentProduct.spaceLocation);
        }
        return undefined;
    }

    function locationOptions(): Option[] {
        return availableLocations.map(location => createLocationOption(location));
    }

    function handleCreateLocationTag(inputValue: string): void {
        setIsLoading(true);

        const location: TagRequest = {
            name: inputValue,
        };
        LocationClient.add(location, uuid).then((result: AxiosResponse) => {
            const newLocation: LocationTag = result.data;
            setAvailableLocations([...availableLocations, newLocation]);
            addGroupedTagFilterOptions(0, newLocation as Tag);
            setCurrentProduct({
                ...currentProduct,
                spaceLocation: newLocation,
            });
            setIsLoading(false);
        });
    }

    function updateSpaceLocations(option: Option): void {
        const updatedProduct: Product = {
            ...currentProduct,
            spaceLocation: option ? optionToSpaceLocation(option) : undefined,
        };
        setCurrentProduct(updatedProduct);
    }

    return (
        <div className="formItem">
            <label className="formItemLabel" htmlFor="location">Location</label>
            <Creatable
                name="location"
                inputId="location"
                onInputChange={(e: string): void => setTypedInLocation(e)}
                onChange={(option): void  => updateSpaceLocations(option as Option)}
                isLoading={isLoading}
                isDisabled={isLoading}
                onCreateOption={handleCreateLocationTag}
                options={locationOptions()}
                styles={customStyles}
                components={{DropdownIndicator: CustomIndicator, Option: CustomOption}}
                formatCreateLabel={(): JSX.Element => CreateNewText(`Create "${typedInLocation}"`)}
                placeholder="Add a location tag"
                hideSelectedOptions={true}
                isClearable={true}
                noOptionsMessage={(): string => `+ Create "${typedInLocation}"` }
                value={locationOptionValue()}
            />
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(ProductFormLocationField);
/* eslint-enable */