/*
 * Copyright (c) 2020 Ford Motor Company
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
import './SpaceSelectionTabs.scss';
import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Dispatch} from 'redux';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from '../Calendar/Calendar';

interface SpaceSelectionTabsProps {
    setCurrentModal(modalState: CurrentModalState): void;
}

function SpaceSelectionTabs({
    setCurrentModal,
}: SpaceSelectionTabsProps): JSX.Element {
    return (
        <div className="spaceSelectionContainer">
            <Calendar/>
            <div className="spaceFiller"/>
            <button className="selectionTabButton tab"
                onClick={(): void => setCurrentModal({modal: AvailableModals.MY_TAGS})}
                data-testid="myTagsButton">
                <i className="material-icons myTagsIcon" data-testid="myTagsIcon">local_offer</i>
                My Tags
            </button>
            <button className="selectionTabButton tab"
                data-testid="myRolesButton"
                onClick={(): void => setCurrentModal({modal: AvailableModals.MY_ROLES_MODAL})}>
                <i className="material-icons myRolesIcon" data-testid="myRolesIcon">assignment_ind</i>
                My Roles
            </button>
            <button type="button" className="addPersonButton"
                data-testid="addPersonButton"
                onClick={(): void => setCurrentModal({modal: AvailableModals.CREATE_PERSON})}>
                <i className="material-icons">add</i>
                Add Person
            </button>
        </div>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(SpaceSelectionTabs);
/* eslint-enable */