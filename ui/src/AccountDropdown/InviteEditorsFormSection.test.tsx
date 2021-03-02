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
import {fireEvent, wait} from '@testing-library/dom';
import {act} from 'react-dom/test-utils';
import Axios, {AxiosResponse} from 'axios';
import Cookies from 'universal-cookie';
import {within} from '@testing-library/react';
import SpaceClient from '../Space/SpaceClient';

describe('Invite Editors Form', function() {
    const cookies = new Cookies();
    beforeEach( () => {
        TestUtils.mockClientCalls();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Axios.delete = jest.fn( x => Promise.resolve({} as AxiosResponse)) as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Axios.put = jest.fn( x => Promise.resolve({} as AxiosResponse)) as any;
        cookies.set('accessToken', '123456');
    });

    describe('feature toggle enabled', () => {
        beforeEach( () => {
            window.location.hash = '#perm';
        });

        afterEach(() => {
            window.location.hash = '';
        });

        it('should show owners and editors for the space', async () => {
            await act(async () => {
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space} as GlobalStateProps);


                const ownerRow = within(await component.findByTestId('userListItem__user_id'));
                ownerRow.getByText(/owner/i);
                ownerRow.getByText(/user_id/i);

                const editorRow = within(await component.findByTestId('userListItem__user_id_2'));
                editorRow.getByText(/editor/i);
                editorRow.getByText(/user_id_2/i);
            });
        });

        it('should remove user', async () => {
            await act(async () => {
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space} as GlobalStateProps);
                const editorRow = within(await component.findByTestId('userListItem__user_id_2'));
                const editor = editorRow.getByText(/editor/i);
                fireEvent.keyDown(editor, {key: 'ArrowDown'});
                const removeButton = await component.findByText(/remove/i);

                SpaceClient.getUsersForSpace = jest.fn().mockReturnValueOnce(Promise.resolve({
                    data: [{'userId': 'user_id', 'permission': 'owner'}],
                } as AxiosResponse));

                await fireEvent.click(removeButton);
                expect(Axios.delete).toHaveBeenCalledWith(
                    `/api/spaces/${TestUtils.space.uuid}/users/user_id_2`,
                    {headers: {Authorization: 'Bearer 123456'}}
                );
                await wait(() => {
                    expect(component.queryByText('user_id_2')).not.toBeInTheDocument();
                    expect(component.queryByText(/editor/i)).not.toBeInTheDocument();
                });
            });
        });

        it('should change owner', async () => {
            await act(async () => {
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space} as GlobalStateProps);
                const editorRow = within(await component.findByTestId('userListItem__user_id_2'));
                const editor = editorRow.getByText(/editor/i);
                fireEvent.keyDown(editor, {key: 'ArrowDown'});
                const permissionButton = await editorRow.findByText(/owner/i);

                SpaceClient.getUsersForSpace = jest.fn().mockReturnValueOnce(Promise.resolve({
                    data: [{'userId': 'user_id', 'permission': 'editor'}, {'userId': 'user_id_2', 'permission': 'owner'}],
                } as AxiosResponse));

                await fireEvent.click(permissionButton);
                expect(Axios.put).toHaveBeenCalledWith(
                    `/api/spaces/${TestUtils.space.uuid}/users/user_id_2`,
                    null,
                    {headers: {Authorization: 'Bearer 123456'}}
                );

                await wait(async () => {
                    const ownerRow = within(await component.findByTestId('userListItem__user_id_2'));
                    ownerRow.getByText(/owner/i);
                    ownerRow.getByText(/user_id_2/i);

                    const editorRow = within(await component.findByTestId('userListItem__user_id'));
                    editorRow.getByText(/editor/i);
                    editorRow.getByText(/user_id/i);
                });
            });
        });
    });

    describe('feature toggle disabled', () => {


        it('should show owners and editors for the space, but not their permissions', async function() {
            await act(async () => {
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space} as GlobalStateProps);
                await component.findByText('user_id');
                expect(component.queryByText('owner')).not.toBeInTheDocument();
                await component.findByText('user_id_2');
                expect(component.queryByText(/editor/i)).not.toBeInTheDocument();
            });
        });

        it('should not open UserAccessList popup', async () => {
            await act(async () => {
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space} as GlobalStateProps);

                await wait(() => {
                    expect(component.queryByTestId('userAccess')).not.toBeInTheDocument();
                });
            });
        });
    });
});
