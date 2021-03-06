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

import {Person} from '../People/Person';
import moment from 'moment';

export interface Assignment {
    id: number;
    person: Person;
    placeholder: boolean;
    productId: number;
    spaceUuid: string;
    effectiveDate?: Date;
    startDate?: Date;
}

export function calculateDuration(assignment: Assignment, viewingDate: Date): number {
    if (assignment.startDate) {
        const viewingDateMoment = moment(viewingDate).startOf('day');
        const startingDateMoment = moment(assignment.startDate).startOf('day');
        return moment.duration(viewingDateMoment.diff(startingDateMoment)).asDays() + 1;
    } else {
        return -1;
    }
}
