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

import React, {ReactElement, useState} from 'react';
import {useSelector} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import './AnnouncementBanner.scss';
import {DEFAULT_BANNER_MESSAGE} from '../Flags/Flags';


export const PREVIOUS_BANNER_MESSAGE_KEY = 'previousBannerMessage';
const BANNER_CLOSED_BY_USER_KEY = 'bannerHasBeenClosedByUser';

export default (): ReactElement => {

    const [closedByUser, setClosedByUser] = useState<string|null>(localStorage.getItem(BANNER_CLOSED_BY_USER_KEY));
    // eslint-disable-next-line
    const flags = useSelector((state: GlobalStateProps) => state.flags);

    const flagsNotReceived = flags.announcementBannerMessage === DEFAULT_BANNER_MESSAGE;

    if (flagsNotReceived) {
        return <></>;
    }

    const bannerIsNew = localStorage.getItem(PREVIOUS_BANNER_MESSAGE_KEY) == null ||
        flags.announcementBannerMessage !== localStorage.getItem(PREVIOUS_BANNER_MESSAGE_KEY);

    if (bannerIsNew) {
        setClosedByUser('');
        localStorage.removeItem(BANNER_CLOSED_BY_USER_KEY);
        localStorage.setItem(PREVIOUS_BANNER_MESSAGE_KEY, flags.announcementBannerMessage);
    }

    return !closedByUser  && flags.announcementBannerEnabled ?
        <aside className="announcementBanner"><div className="bannerSpacing">{flags ? flags.announcementBannerMessage : ''}</div>
            <button
                onClick={(): void => {
                    setClosedByUser('true');
                    localStorage.setItem(BANNER_CLOSED_BY_USER_KEY, 'true');
                }}
                className="material-icons closeButton bannerSpacing"
                aria-label="Close Announcement Banner"
            >close</button>
        </aside>
        : <></>;
};
