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
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {Space} from '../Space/Space';
import PeopleMoverLogo from '../ReusableComponents/PeopleMoverLogo';
import ProductFilter from '../SortingAndFiltering/ProductFilter';
import ProductSortBy from '../SortingAndFiltering/ProductSortBy';
import AccountDropdown from '../AccountDropdown/AccountDropdown';

import './Headers.scss';

interface HeaderProps {
    hideSpaceButtons?: boolean;
    hideAllButtons?: boolean;
    currentSpace: Space;
}

function Header({
    hideSpaceButtons, 
    hideAllButtons,
    currentSpace,
}: HeaderProps): JSX.Element {
    const dashboardPathname = '/user/dashboard';
    const logoHref = window.location.pathname === dashboardPathname ? '' : dashboardPathname;
    const spaceName = currentSpace?.name;

    const NEW_UI = window.location.hash === '#newui';

    return (
        <header className="peopleMoverHeader">
            <div className="headerLeftContainer">
                <PeopleMoverLogo href={logoHref} />
                {spaceName && <h1 className="spaceName">{spaceName}</h1>}
            </div>
            {!hideAllButtons &&
                <div className="headerRightContainer">
                    {!hideSpaceButtons && !NEW_UI &&
                        <>
                            <ProductFilter/>
                            <ProductSortBy/>
                        </>
                    }
                    <AccountDropdown hideSpaceButtons={hideSpaceButtons}/>
                </div>
            }
        </header>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(Header);
/* eslint-enable */
