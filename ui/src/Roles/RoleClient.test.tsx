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

import Axios, {AxiosResponse} from 'axios';
import RoleClient from './RoleClient';
import TestUtils from '../tests/TestUtils';

describe('Role Client', function() {
    const spaceUuid = 'uuid';
    const baseRolesUrl = `/api/spaces/${spaceUuid}/roles`;

    beforeEach(() => {
        Axios.post = jest.fn(x => Promise.resolve({
            data: 'Created Role',
        } as AxiosResponse));
        Axios.put = jest.fn(x => Promise.resolve({
            data: 'Updated Role',
        } as AxiosResponse));
        Axios.delete = jest.fn(x => Promise.resolve({
            data: 'Deleted Role',
        } as AxiosResponse));
        Axios.get = jest.fn(x => Promise.resolve({
            data: 'Get Roles',
        } as AxiosResponse));
    });

    it('should return all roles for space', function(done) {
        RoleClient.get(spaceUuid)
            .then((response) => {
                expect(Axios.get).toHaveBeenCalledWith(baseRolesUrl);
                expect(response.data).toBe('Get Roles');
                done();
            });

    });

    it('should create a role and return that role', function(done) {
        const expectedRoleAddRequest = { name: TestUtils.softwareEngineer.name };
        RoleClient.add(expectedRoleAddRequest, spaceUuid)
            .then((response) => {
                const expectedConfig = { headers: { 'Content-Type': 'application/json' } };
                expect(Axios.post).toHaveBeenCalledWith(
                    baseRolesUrl, expectedRoleAddRequest, expectedConfig
                );
                expect(response.data).toBe('Created Role');
                done();
            });
    });

    it('should edit a role and return that role', function(done) {
        const expectedRoleEditRequest = {
            id: TestUtils.softwareEngineer.id,
            name: TestUtils.softwareEngineer.name,
        };
        RoleClient.edit(expectedRoleEditRequest, spaceUuid)
            .then((response) => {
                const expectedConfig = { headers: { 'Content-Type': 'application/json' } };
                expect(Axios.put).toHaveBeenCalledWith(
                    baseRolesUrl, expectedRoleEditRequest, expectedConfig
                );
                expect(response.data).toBe('Updated Role');
                done();
            });
    });

    it('should delete a role', function(done) {
        const expectedUrl = `${baseRolesUrl}/${TestUtils.softwareEngineer.id}`;
        RoleClient.delete(TestUtils.softwareEngineer.id, spaceUuid)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl);
                expect(response.data).toBe('Deleted Role');
                done();
            });
    });
});