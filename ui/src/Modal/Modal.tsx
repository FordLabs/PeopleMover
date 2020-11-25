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

import React, {useEffect, useState} from 'react';
import {JSX} from '@babel/types';
import ConfirmationModal, {ConfirmationModalProps} from './ConfirmationModal';

interface ModalProps {
    modalForm: JSX.Element | null;
    title: string;

    closeModal(): void;
}

function Modal({
    modalForm,
    title,
    closeModal,
}: ModalProps): JSX.Element | null {
    const [shouldShowConfirmCloseModal, setShouldShowConfirmCloseModal] = useState<boolean>(false);
    const [confirmCloseModal, setConfirmCloseModal] = useState<JSX.Element | null>(null);

    const onKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape' && modalForm) {
            close();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown, false);

        return (): void => {
            document.removeEventListener('keydown', onKeyDown, false);
        };
    }, [modalForm]);

    useEffect(() => {
        let bodyOverflowState = 'unset';
        if (modalForm !== null) bodyOverflowState = 'hidden';
        document.body.style.overflow = bodyOverflowState;
    }, [modalForm]);

    let customModalForm = null;

    function showCloseModalWarning(): void {
        const propsForCloseConfirmationModal: ConfirmationModalProps = {
            submit: () => {
                closeModal();
                setConfirmCloseModal(null);
            },
            close: () => {
                setConfirmCloseModal(null);
            },
            confirmClose: true,
            warningMessage: 'You have unsaved changes. Closing the window will result in the changes being discarded.',
            submitButtonLabel: 'Close',
        };
        const confirmConfirmationModal: JSX.Element = ConfirmationModal(propsForCloseConfirmationModal);
        setConfirmCloseModal(confirmConfirmationModal);
    }

    function close(): void {
        if (shouldShowConfirmCloseModal) {
            showCloseModalWarning();
        } else {
            closeModal();
        }
    }

    if (modalForm !== null) {
        customModalForm = React.cloneElement(
            modalForm,
            {setShouldShowConfirmCloseModal: setShouldShowConfirmCloseModal}
        );
        return (
            <>
                <div
                    aria-modal
                    aria-labelledby={title}
                    tabIndex={-1}
                    role="dialog"
                    className="modalContainer"
                    data-testid="modalContainer">
                    <div className="modalDialogContainer">
                        <div className="modalPopupContainer"
                            data-testid="modalPopupContainer">
                            <div className="modalTitleAndCloseButtonContainer">
                                <div className="modalTitleSpacer"/>
                                <div className="modalTitle">{title}</div>
                                <button
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    className="material-icons closeButton"
                                    onClick={close}
                                    data-testid="modalCloseButton">
                                    close
                                </button>
                            </div>
                            {customModalForm ? customModalForm : modalForm}
                            {confirmCloseModal}
                        </div>
                    </div>
                </div>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                <div className="modalBackground" onClick={close} data-testid="modalBackgroundContainer" />
            </>
        );
    } else {
        return null;
    }
}

export default Modal;
