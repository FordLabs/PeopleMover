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

import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import React from 'react';
import InviteEditorsFormSection from './InviteEditorsFormSection';
import {GlobalStateProps} from '../Redux/Reducers';
import {fireEvent} from '@testing-library/dom';

describe('Invite Editors Form', function() {
    beforeEach( () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    it('should show owners and editors for the space', async function() {
        const component = renderWithRedux(<InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space} as GlobalStateProps);
        await component.findByText('user_id');
        await component.findByText('owner');
        await component.findByText('user_id_2');
        await component.findByText(/editor/i);
    });

    it('should open UserAccessList popup', async () => {
        const component = renderWithRedux(<InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space} as GlobalStateProps);
        const editor = await component.findByTestId('userAccess');
        fireEvent.keyDown(editor.children[0], {key: 'ArrowDown'});
        await component.findByText(/remove/i);
    });
});
