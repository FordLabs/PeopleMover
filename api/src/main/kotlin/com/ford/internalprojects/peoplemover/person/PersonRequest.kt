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

package com.ford.internalprojects.peoplemover.person

import com.fasterxml.jackson.annotation.JsonProperty
import com.ford.internalprojects.peoplemover.role.SpaceRole
import javax.validation.constraints.Max
import javax.validation.constraints.NotEmpty
import javax.validation.constraints.Size

data class PersonRequest(

        @field:NotEmpty(message = "Name cannot be empty.")
        @field:Size(max = 255, message = "Name cannot exceed 255 characters.")
        val name: String,

        val spaceRole: SpaceRole? = null,

        @field:Size(max = 255, message = "Notes cannot exceed 255 characters.")
        val notes: String? = "",

        @JsonProperty
        var newPerson: Boolean = false
)

fun PersonRequest.toPerson(spaceUuid: String, id: Int? = null): Person = Person(
        id = id,
        name = this.name,
        spaceRole = this.spaceRole,
        notes = this.notes,
        newPerson = this.newPerson,
        spaceUuid = spaceUuid
)