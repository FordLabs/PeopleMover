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

import React, {CSSProperties, FormEvent, useEffect, useState} from 'react';
import SpaceClient from '../Space/SpaceClient';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {closeModalAction, setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import FormButton from '../ModalFormComponents/FormButton';
import {GlobalStateProps} from '../Redux/Reducers';
import {Space} from '../Space/Space';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';
import {AvailableModals} from '../Modal/AvailableModals';

import './InviteEditorsFormSection.scss';
import UserAccessList from '../ReusableComponents/UserAccessList';
import Creatable from 'react-select/creatable';
import {reactSelectStyles} from '../ModalFormComponents/ReactSelectStyles';
import {InputActionMeta, Props} from 'react-select';
import {Option} from '../CommonTypes/Option';
import {validate, nameSplitPattern, userIdPattern} from '../Utils/UserIdValidator';

const inviteEditorsStyle = {
    ...reactSelectStyles,
    control: (provided: CSSProperties, {isFocused}: Props): CSSProperties => ({
        ...provided,
        minHeight: '32px',
        borderRadius: '2px',
        padding: '0',
        // These lines disable the blue border
        boxShadow: isFocused ? '0 0 0 2px #4C8EF5' : 'none',
        border: 'none',
        width: '100%',
        height: '100%',
        backgroundColor: '#F2F2F2',
        // @ts-ignore
        '&:hover': {
            cursor: 'pointer',
        },
    }),
};


interface InviteEditorsFormProps {
    collapsed?: boolean;
    currentSpace: Space;
    currentUser: string;
    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
}

const getUsers = (currentSpace: Space, setUsersList: (usersList: UserSpaceMapping[]) => void): void => {
    if (currentSpace.uuid) {
        SpaceClient.getUsersForSpace(currentSpace.uuid).then((users) => setUsersList(users));
    }
};

function InviteEditorsFormSection({collapsed, currentSpace, currentUser, closeModal, setCurrentModal}: InviteEditorsFormProps): JSX.Element {
    const isExpanded = !collapsed;
    const [invitedUserIds, setInvitedUserIds] = useState<Option[]>([]);
    const [inputValue, setInputValue] = useState<string>('');
    const [enableInviteButton, setEnableInviteButton] = useState<boolean>(false);
    const [usersList, setUsersList] = useState<UserSpaceMapping[]>([]);
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const components: any = {
        DropdownIndicator: null,
    };

    useEffect(() => {
        getUsers(currentSpace, setUsersList);
    }, [currentSpace, setUsersList]);

    const inviteUsers = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        await SpaceClient.inviteUsersToSpace(currentSpace, invitedUserIds.map(userId => userId.value))
            .catch(console.error)
            .finally(() => {
                setCurrentModal({modal: AvailableModals.GRANT_EDIT_ACCESS_CONFIRMATION});
            });
    };

    useEffect(() => {
        const enable = (invitedUserIds.length > 0 && inputValue.trim().length === 0)
                || (!!inputValue.trim().match(userIdPattern));
        const errMsg = inputValue.length > 1 && !inputValue.match(userIdPattern);
        setEnableInviteButton(enable);
        setShowErrorMessage(errMsg);
    }, [invitedUserIds, inputValue]);

    const addUser = (user: string): void => {
        const inputUsers = validate(user);
        setInvitedUserIds([...invitedUserIds, ...inputUsers.options]);
        setInputValue(inputUsers.notValid);
    };

    const onInputChange = (user: string, inputActionMeta: InputActionMeta): void => {
        if (nameSplitPattern.test(user)) {
            addUser(user);
        } else if (inputActionMeta?.action === 'input-change')  {
            setInputValue(user);
        }
    };

    const onChange = (input: unknown): void => {
        let options: Option[] = [];
        if (input) {
            options = input as Option[];
        }
        setInvitedUserIds([...options]);
    };

    function handleKeyDownEvent(key: React.KeyboardEvent<HTMLElement>): void {
        if (key.key === 'Enter') {
            key.preventDefault();
            addUser(inputValue);
        }
    }

    function UserPermission({user}: { user: UserSpaceMapping }): JSX.Element {
        if (user.permission !== 'owner') {
            const spaceOwner = usersList.filter(user => user.permission === 'owner')[0];
            const isUserOwner = spaceOwner.userId.toUpperCase() === currentUser.toUpperCase();
            return <UserAccessList currentSpace={currentSpace} user={user} currentUser={currentUser} onChange={(): void => {getUsers(currentSpace, setUsersList);}} owner={spaceOwner} isUserOwner={isUserOwner}/>;
        } else {
            return <span className="userPermission" data-testid="userIdPermission">{user.permission}</span>;
        }
    }

    return (
        <form className="inviteEditorsForm form" onSubmit={inviteUsers}>
            {!isExpanded && <span className={'inviteEditorsLabel'}>People with this permission can edit</span>}
            {isExpanded && (
                <>
                    <label htmlFor="employeeIdTextArea" className="inviteEditorsLabel">
                    People with this permission can edit
                        <Creatable
                            className="employeeIdTextArea"
                            inputId="employeeIdTextArea"
                            // @ts-ignore
                            styles={inviteEditorsStyle}
                            placeholder="Enter CDSID of your editors"
                            menuIsOpen={false}
                            isMulti={true}
                            hideSelectedOptions={true}
                            isClearable={false}
                            components={components}
                            hidden={collapsed}
                            value={invitedUserIds}
                            options={invitedUserIds}
                            onChange={onChange}
                            onInputChange={onInputChange}
                            inputValue={inputValue}
                            onKeyDown={handleKeyDownEvent}
                            onBlur={(): void => {addUser(inputValue);}}
                        />
                        <div className="userIdErrorMessage">
                            { showErrorMessage &&
                                <>
                                    <i className="material-icons userIdErrorMessageIcon" aria-hidden>report_problem</i>
                                    <span data-testid="inviteEditorsFormErrorMessage">Please enter a valid CDSID</span>
                                </>
                            }
                        </div>
                    </label>
                    <div>
                        <ul className="userList">
                            {usersList.map((user, index) => {
                                return (
                                    <li className="userListItem" key={index} data-testid={`userListItem__${user.userId}`}>
                                        <i className="material-icons editorIcon" aria-hidden>account_circle</i>
                                        <span className="userName" data-testid="userIdName">{user.userId}</span>
                                        <UserPermission user={user}/>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="buttonsContainer" hidden={collapsed}>
                        <FormButton
                            buttonStyle="secondary"
                            className="cancelButton"
                            onClick={closeModal}>
                            Cancel
                        </FormButton>
                        <FormButton
                            type="submit"
                            buttonStyle="primary"
                            testId="inviteEditorsFormSubmitButton"
                            disabled={!enableInviteButton}
                        >
                            Invite
                        </FormButton>
                    </div>
                </>
            )}
        </form>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    currentUser: state.currentUser,
});

export default connect(mapStateToProps, mapDispatchToProps)(InviteEditorsFormSection);
/* eslint-enable */
