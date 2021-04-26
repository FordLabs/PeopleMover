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
import {ConditionalWrapper} from './ConditionalWrapper';
import {renderWithRedux} from '../tests/TestUtils';

describe('ConditionalWrapper', () => {
    const trueOutput = 'True Output';
    const falseOutput = 'False Output';

    const trueCondition = (): boolean => true;
    const falseCondition = (): boolean => false;

    const trueWrapper = (): JSX.Element => <>{trueOutput}</>;
    const falseWrapper = (): JSX.Element => <>{falseOutput}</>;

    it('should render true path', async () => {
        const app = renderWithRedux(
            <ConditionalWrapper
                condition={trueCondition}
                wrapper={trueWrapper}
            >
                {falseWrapper()}
            </ConditionalWrapper>);
        await app.findByText(trueOutput);
    });

    it('should render false path', async () => {
        const app = renderWithRedux(
            <ConditionalWrapper
                condition={falseCondition}
                wrapper={trueWrapper}
            >
                {falseWrapper()}
            </ConditionalWrapper>);
        await app.findByText(falseOutput);
    });
});