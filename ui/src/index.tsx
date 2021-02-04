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

import './Application/Styleguide/Colors.scss';

import * as React from 'react';
import ReactDOM from 'react-dom';
import axe from 'react-axe';
import {Provider} from 'react-redux';
import {applyMiddleware, compose, createStore, StoreEnhancer} from 'redux';
import rootReducer from './Redux/Reducers';
import thunk from 'redux-thunk';
import {RedirectToADFS} from './Auth/AuthenticatedRoute';
import Axios from 'axios';
import UnsupportedBrowserPage from './UnsupportedBrowserPage/UnsupportedBrowserPage';
import FocusRing from './FocusRing';
import MatomoEvents from './Matomo/MatomoEvents';
import CacheBuster from './CacheBuster';
import {removeToken} from './Auth/TokenProvider';
import Routes from './Routes';

let reduxDevToolsExtension: Function | undefined = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
let reduxDevToolsEnhancer: Function | undefined;
if (reduxDevToolsExtension) {
    reduxDevToolsEnhancer = (window as any).__REDUX_DEVTOOLS_EXTENSION__();
}

let composedEnhancers: StoreEnhancer;
if (reduxDevToolsEnhancer) {
    composedEnhancers = compose(
        applyMiddleware(thunk),
        reduxDevToolsEnhancer,
    );
} else {
    composedEnhancers = compose(
        applyMiddleware(thunk)
    );
}

if (process.env.NODE_ENV !== 'production') {
    axe(React, ReactDOM, 1000);
}

const store = createStore(
    rootReducer,
    composedEnhancers,
);

declare global {
    interface Window {
        runConfig: RunConfig;
    }
}

export interface RunConfig {
    auth_enabled: boolean;
    ford_labs_url: string;
    invite_users_to_space_enabled: boolean;
    adfs_url_template: string;
    adfs_client_id: string;
    adfs_resource: string;
}

window.addEventListener('keydown', FocusRing.turnOnWhenTabbing);

const UNAUTHORIZED = 401;
Axios.interceptors.response.use(
    response => response,
    error => {
        const {status, statusText, config} = error.response;

        if (status === UNAUTHORIZED) {
            removeToken();
            RedirectToADFS();
        } else {
            let conventionizedErrorName = `${statusText} - ${status}`;
            MatomoEvents.pushEvent(conventionizedErrorName, config.method, config.url, status);
        }
        return Promise.reject(error);
    }
);

function isUnsupportedBrowser(): boolean {
    // Safari 3.0+ "[object HTMLElementConstructor]"
    /* eslint-disable */
    // @ts-ignore
    var isSafari = /constructor/i.test(window.HTMLElement) || (function(p): boolean { return p.toString() === '[object SafariRemoteNotification]'; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    /* eslint-enable */

    // Internet Explorer 6-11
    // @ts-ignore
    var isIE = /*@cc_on!@*/!!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    return isSafari || isIE || isEdge;
}

interface CacheBusterProps {
    loading: boolean;
    isLatestVersion: boolean;
    refreshCacheAndReload: Function;
}

if (isUnsupportedBrowser()) {
    ReactDOM.render(
        <UnsupportedBrowserPage/>,
        document.getElementById('root')
    );
} else {
    const url = '/api/config';
    const config = {headers: {'Content-Type': 'application/json'}};
    Axios.get(url, config)
        .then((response) => {
            window.runConfig = Object.freeze(response.data);

            ReactDOM.render(
                <CacheBuster>
                    {({loading, isLatestVersion, refreshCacheAndReload}: CacheBusterProps): JSX.Element | null => {
                        if (loading) return null;
                        if (!loading && !isLatestVersion) {
                            refreshCacheAndReload();
                        }

                        return (
                            <Provider store={store}>
                                <Routes />
                            </Provider>
                        );
                    }}
                </CacheBuster>,
                document.getElementById('root')
            );
        });
}
