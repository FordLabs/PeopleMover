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

import {fireEvent, render} from '@testing-library/react';
import React from 'react';
import EditMenu, {EditMenuOption} from '../ReusableComponents/EditMenu';
import TestUtils from './TestUtils';

describe('The edit menu', () => {

    describe('for a person card', () => {
        const menuOptionList: EditMenuOption[] = [
            {
                callback: TestUtils.dummyCallback,
                text: 'Edit Person',
                icon: 'fa-user-circle',
            },
            {
                callback: TestUtils.dummyCallback,
                text: 'Mark as Placeholder',
                icon: 'fa-pen',

            },
            {
                callback: TestUtils.dummyCallback,
                text: 'Cancel Assignment',
                icon: 'fa-trash',
            },
        ];

        it('should render the right static content', async () => {
            const underTest = render(<EditMenu menuOptionList={menuOptionList} onClosed={TestUtils.dummyCallback}/>);

            await underTest.findByText('Edit Person');
            const firstIcon = await underTest.findByTestId('editMenuOption0');
            expect(firstIcon).toHaveClass(menuOptionList[0].icon);

            await underTest.findByText('Mark as Placeholder');
            const secondIcon = await underTest.findByTestId('editMenuOption1');
            expect(secondIcon).toHaveClass(menuOptionList[1].icon);

            await underTest.findByText('Cancel Assignment');
            const thirdIcon = await underTest.findByTestId('editMenuOption2');
            expect(thirdIcon).toHaveClass(menuOptionList[2].icon);
        });

        it('should call the right callback when menu option is clicked', () => {
            let testPassed = false;

            function makeTestPass(): void {
                testPassed = true;
            }

            menuOptionList[0].callback = makeTestPass;

            const underTest = render(<EditMenu menuOptionList={menuOptionList} onClosed={TestUtils.dummyCallback}/>);
            expect(testPassed).toBeFalsy();
            fireEvent.mouseDown(underTest.getByText('Edit Person'));
            fireEvent.mouseUp(underTest.getByText('Edit Person'));
            expect(testPassed).toBeTruthy();
        });
    });

    describe('for a product card', () => {
        it('should render the right static content', async () => {
            const menuOptionList: EditMenuOption[] = [
                {
                    callback: TestUtils.dummyCallback,
                    text: 'Edit product',
                    icon: 'fa-user-circle',
                },
                {
                    callback: TestUtils.dummyCallback,
                    text: 'Archive product',
                    icon: 'fa-inbox',
                },
            ];
            const underTest = render(<EditMenu menuOptionList={menuOptionList} onClosed={TestUtils.dummyCallback}/>);
            await underTest.findByText('Edit product');
            const firstIcon = await underTest.findByTestId('editMenuOption0');
            expect(firstIcon).toHaveClass(menuOptionList[0].icon);

            await underTest.findByText('Archive product');
            const secondIcon = await underTest.findByTestId('editMenuOption1');
            expect(secondIcon).toHaveClass(menuOptionList[1].icon);
        });
    });
});