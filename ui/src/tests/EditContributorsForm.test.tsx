/*
 * Copyright (c) 2019 Ford Motor Company
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

import {fireEvent, RenderResult, wait} from "@testing-library/react";
import TestUtils, {renderWithRedux} from "./TestUtils";
import PeopleMover from "../Application/PeopleMover";
import React from "react";
import {Router} from "react-router-dom";
import {createMemoryHistory} from "history";
import SpaceClient from "../SpaceDashboard/SpaceClient";

describe('Edit Contributors Form',  () => {
    let app: RenderResult;
    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        process.env.REACT_APP_INVITE_USERS_TO_SPACE_ENABLED = 'true';

        const history = createMemoryHistory({ initialEntries: ['/teamName'] });

        await wait(async () => {

            app = renderWithRedux(
                <Router history={history}>
                    <PeopleMover/>
                </Router>
            );

        });
        const userIconButton = await app.findByTestId('userIcon');
        fireEvent.click(userIconButton);
    });

    it('Should open Edit Contributors modal on click of text',  () => {
        expect(app.getByText('Edit Contributors'));
    });

    it('should close Edit Contributors modal on click of Cancel button', async () => {
        const cancelButton = await app.findByText('Cancel');
        fireEvent.click(cancelButton);

        expect(app.queryByText('Edit Contributors')).toBe(null);
    });

    it('should submit invited contributors, current space name, and access token on click of Save button', async () => {

        SpaceClient.inviteUsersToSpace = jest.fn().mockImplementation(() => Promise.resolve({}));

        const usersToInvite = app.getByTestId('emailTextArea');
        fireEvent.change(usersToInvite, { target: { value: 'some1@email.com,some2@email.com,some3@email.com' } });

        const saveButton = await app.findByText('Save');
        fireEvent.click(saveButton);

        expect(SpaceClient.inviteUsersToSpace).toHaveBeenCalledWith('teamName', ['some1@email.com', 'some2@email.com', 'some3@email.com']);
    });
});
