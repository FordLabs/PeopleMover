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
import {renderWithRedux} from '../tests/TestUtils';
import Branding from './Branding';
import {RunConfig} from '../index';

describe('Branding', () => {
    const expectedUrl = 'http://url.com';

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/camelcase
        window.runConfig = {ford_labs_url: expectedUrl} as RunConfig;
    });
    
    it('should get url from config', () => {
        const comp = renderWithRedux(<Branding />);
        const actualUrl = comp.getByText('FordLabs');
        expect(actualUrl).toHaveAttribute('href', expectedUrl);
    });
});