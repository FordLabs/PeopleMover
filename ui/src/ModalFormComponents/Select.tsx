/*
 *   Copyright (c) 2020 Ford Motor Company
 *   All rights reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, {ReactNode, useEffect, useState} from 'react';
import Option from './Option';
import './Select.scss';

interface OptionType {
    value: unknown;
    displayValue: ReactNode | string;
}

interface Props {
    defaultOption: OptionType;
    options: Array<OptionType>;
}

const Select = ({ options, defaultOption }: Props): JSX.Element => {
    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);
    const [currentOption, setCurrentOption] = useState<OptionType>(defaultOption);

    const showDropdown = (): void => {
        if (dropdownToggle) {
            hideDropdown();
        } else {
            setDropdownToggle(!dropdownToggle);
            document.addEventListener('click', hideDropdown, false);
        }
    };

    const hideDropdown = (): void => {
        setDropdownToggle(false);
        document.removeEventListener('click', hideDropdown);
    };

    const Dropdown = (): JSX.Element => {
        return (
            <div className="selectDropdownOptions">
                {options && options.map((option, index) => {
                    const onClick = (): void => {setCurrentOption(option);};
                    return (
                        <Option key={`select-option-${index}`} onClick={onClick}>
                            {option.displayValue}
                        </Option>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="selectDropdown">
            <div className="selectDropdownSelectedValue" onClick={showDropdown}>
                <i className={`selectDropdownArrow fas ${ dropdownToggle ? 'fa-caret-up' : 'fa-caret-down' }`} />
                {currentOption.displayValue}
            </div>
            {dropdownToggle && <Dropdown />}
        </div>
    );
};

export default Select;

