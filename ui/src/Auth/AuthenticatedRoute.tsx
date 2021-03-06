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

import {Route, RouteProps} from 'react-router';
import * as React from 'react';
import {useState} from 'react';
import {AccessTokenClient} from '../Login/AccessTokenClient';
import {useOnLoad} from '../ReusableComponents/UseOnLoad';
import {getToken} from './TokenProvider';
import {setOauthRedirect} from '../ReusableComponents/OAuthRedirect';

export function AuthenticatedRoute<T extends RouteProps>(props: T): JSX.Element {
    const {children, ...rest} = props;
    const [renderedElement, setRenderedElement] = useState<JSX.Element>(<></>);


    useOnLoad(() => {
        const accessToken = getToken();

        AccessTokenClient.validateAccessToken(accessToken)
            .then(() => setRenderedElement(<Route {...rest}>{children}</Route>))
            .catch(() => setRenderedElement(<RedirectToADFS/>));
    });

    return <>{renderedElement}</>;
}

export function RedirectToADFS(): null {
    setOauthRedirect(window.location.pathname);

    /* eslint-disable @typescript-eslint/camelcase */
    let oauthUri: string = window.runConfig.adfs_url_template;
    const clientId: string = window.runConfig.adfs_client_id;
    const resource: string = window.runConfig.adfs_resource;
    /* eslint-enable @typescript-eslint/camelcase */
    const redirectUri = `${window.location.origin}/adfs/catch`;

    oauthUri = oauthUri.replace('%s', clientId);
    oauthUri = oauthUri.replace('%s', resource);
    oauthUri = oauthUri.replace('%s', redirectUri);

    window.location.href = oauthUri;

    return null;
}
