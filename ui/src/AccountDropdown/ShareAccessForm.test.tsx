/*
 *
 *  Copyright (c) 2020 Ford Motor Company
 *  All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import React from 'react';
import {fireEvent, RenderResult, wait} from '@testing-library/react';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import {AxiosResponse} from 'axios';
import SpaceClient from '../Space/SpaceClient';
import {createStore, Store} from 'redux';
import ShareAccessForm from './ShareAccessForm';
import {Space} from '../Space/Space';
import {setCurrentSpaceAction} from '../Redux/Actions';


Object.assign(navigator, {
    clipboard: {
        writeText: (): void => {
            return;
        },
    },
});

describe('Share Access Form', () => {
    let originalWindow: Window;
    const testSpace = TestUtils.space;
    const testSpaceWithViewOnlyOn = {...testSpace, todayViewIsPublic: true};
    const testSpaceWithViewOnlyOff = {...testSpace, todayViewIsPublic: false};

    const expectedUrl = 'https://some-url';

    describe('View Only Access Form Section', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            originalWindow = window;
            delete window.location;
            (window as Window) = Object.create(window);
            window.location = {href: expectedUrl} as Location;
        });

        afterEach(() => {
            (window as Window) = originalWindow;
        });

        it('should show correct space URL', async () => {
            const { component } = setupComponent(testSpaceWithViewOnlyOn);

            const actualLinkToSpace = await component.findByTestId('linkToSpace');
            expect(actualLinkToSpace.getAttribute('value')).toBe(expectedUrl);
        });

        it('should copy the url to clipboard', async () => {
            const { component } = setupComponent(testSpaceWithViewOnlyOn);
            jest.spyOn(navigator.clipboard, 'writeText');

            await wait(() => {
                fireEvent.click(component.getByText('Copy link'));
            });

            expect(navigator.clipboard.writeText).toBeCalledWith(expectedUrl);
        });

        it('should should change text on copy', async () => {
            const { component } = setupComponent(testSpaceWithViewOnlyOn);
            await wait(() => {
                fireEvent.click(component.getByText('Copy link'));
            });

            expect(component.queryByText('Copy link')).toBeNull();
            expect(component.queryByText('Copied!')).not.toBeNull();
        });

        it('should populate Enable View Only toggle with information from current space', function() {
            const { component } = setupComponent(testSpaceWithViewOnlyOn);
            const enableViewOnlyCheckbox = component.getByTestId('viewOnlyAccessToggle');
            expect(enableViewOnlyCheckbox).toBeChecked();
        });

        it('should update the current space when the toggle is clicked', async function() {
            const { component, store } = setupComponent(testSpaceWithViewOnlyOn);

            const expectedUpdatedSpaceData = {...testSpace, todayViewIsPublic: false};
            SpaceClient.editSpace = jest.fn(() => Promise.resolve({
                data: expectedUpdatedSpaceData,
            } as AxiosResponse));

            const enableViewOnlyCheckbox = component.getByTestId('viewOnlyAccessToggle');
            expect(enableViewOnlyCheckbox).toBeChecked();
            await fireEvent.click(enableViewOnlyCheckbox);

            expect(SpaceClient.editSpace).toHaveBeenCalledWith(
                testSpace.uuid,
                expectedUpdatedSpaceData,
                testSpace.name
            );

            expect(store.dispatch).toHaveBeenCalledWith(setCurrentSpaceAction(expectedUpdatedSpaceData));
        });

        it('should have copy link button disabled when ready only view is turned off', async function() {
            const { component } = setupComponent(testSpaceWithViewOnlyOff);

            const viewOnlyAccessFormCopyLinkButton = component.getByTestId('viewOnlyAccessFormCopyLinkButton');
            expect(viewOnlyAccessFormCopyLinkButton).toBeDisabled();
        });
    });
});

const setupComponent = (currentSpace: Space): { component: RenderResult; store: Store } => {
    let store = createStore(rootReducer,  {currentSpace});
    store.dispatch = jest.fn();
    const component = renderWithRedux(
        <ShareAccessForm/>,
        store,
        {currentSpace: currentSpace} as GlobalStateProps
    );

    return { component, store };
};
