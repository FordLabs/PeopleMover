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

import Axios, {AxiosResponse} from 'axios';
import {getToken} from '../Auth/TokenProvider';

export class AccessTokenClient {
    static async validateAccessToken(accessToken: string): Promise<AxiosResponse> {
        const url = '/api/access_token/validate';
        const data = {
            accessToken: accessToken,
        };
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, data, config);
    }

    static async userCanAccessSpace(accessToken: string, uuid: string): Promise<AxiosResponse> {
        const url = '/api/access_token/authenticate';
        const data = {
            accessToken: accessToken,
            uuid: uuid,
        };
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, data, config);
    }
}
