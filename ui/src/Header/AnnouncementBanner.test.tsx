import AnnouncementHeader from './AnnouncementBanner';
import React from 'react';

import {render} from '@testing-library/react';
import {createStore} from 'redux';
import rootReducer from '../Redux/Reducers';

import {Provider} from 'react-redux';

describe('announcement header', () => {
    beforeEach(() => {
        localStorage.clear();
    });
    it('should hide itself when you click close', () => {
        const store = createStore(rootReducer, {flags:{
            announcementBannerMessage: 'hello i am a banner',
            announcementBannerEnabled: true,
        }});

        const banner = render(
            <Provider store={store}>
                <AnnouncementHeader/>,
            </Provider>
        );

        expect(banner.getByText('hello i am a banner')).toBeInTheDocument();
        banner.getByText('close').click();
        expect(banner.queryByText('hello i am a banner')).not.toBeInTheDocument();
    });

    it('should not display if announcement banner enabled flag is disabled',  () => {
        const store = createStore(rootReducer, {flags:{
            announcementBannerMessage: 'hello i am a banner',
            announcementBannerEnabled: false,
        }});

        const banner = render(
            <Provider store={store}>
                <AnnouncementHeader/>,
            </Provider>
        );

        expect(banner.queryByText('hello i am a banner')).not.toBeInTheDocument();
    });


    it('should not display if banner has been closed by user and the message has not changed', () => {

        const store = createStore(rootReducer, {flags:{
            announcementBannerMessage: 'hello i am a banner',
            announcementBannerEnabled: true,
        }});

        const banner = render(
            <Provider store={store}>
                <AnnouncementHeader/>,
            </Provider>
        );

        expect(banner.queryByText('hello i am a banner')).toBeInTheDocument();
        banner.getByText('close').click();
        expect(banner.queryByText('hello i am a banner')).not.toBeInTheDocument();
        const newBanner = render(
            <Provider store={store}>
                <AnnouncementHeader/>,
            </Provider>
        );
        expect(newBanner.queryByText('hello i am a banner')).not.toBeInTheDocument();

    });

    it('should display if banner has been closed by user and the message has changed', () => {

        localStorage.setItem('previousBannerMessage', 'hello i am a banner');
        localStorage.setItem('bannerHasBeenClosedByUser', 'true');

        const store = createStore(rootReducer, {flags:{
            announcementBannerMessage: 'hello i am a different banner',
            announcementBannerEnabled: true,
        }});

        const banner = render(
            <Provider store={store}>
                <AnnouncementHeader/>,
            </Provider>
        );
        expect(banner.queryByText('hello i am a different banner')).toBeInTheDocument();

    });
});
