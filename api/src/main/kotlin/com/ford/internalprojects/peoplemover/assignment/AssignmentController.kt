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

package com.ford.internalprojects.peoplemover.assignment

import com.ford.internalprojects.peoplemover.space.SpaceService
import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
class AssignmentController(
        private val assignmentService: AssignmentService,
        private val spaceService: SpaceService,
        private val logger: BasicLogger
) {

    @PreAuthorize("hasPermission(#spaceUuid, 'read')")
    @GetMapping("/api/spaces/{spaceUuid}/person/{personId}/assignments/date/{requestedDate}")
    fun getAssignmentsByPersonIdForDate(@PathVariable spaceUuid: String, @PathVariable personId: Int, @PathVariable requestedDate: String): ResponseEntity<List<Assignment>> {
        spaceService.checkReadOnlyAccessByDate(requestedDate, spaceUuid)

        val assignmentsForPerson = assignmentService.getAssignmentsForTheGivenPersonIdAndDate(personId, LocalDate.parse(requestedDate))
        logger.logInfoMessage("All assignments retrieved for person with id: [$personId] on date: [$requestedDate].")
        return ResponseEntity.ok(assignmentsForPerson)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'modify')")
    @GetMapping(path = ["/api/spaces/{spaceUuid}/assignment/dates"])
    fun getAllEffectiveDates(@PathVariable spaceUuid: String): ResponseEntity<Set<LocalDate>> {
        val dates = assignmentService.getEffectiveDates(spaceUuid)
        logger.logInfoMessage("All effective dates retrieved for space with uuid: [$spaceUuid].")
        return ResponseEntity.ok(dates)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'read')")
    @GetMapping(path = ["/api/spaces/{spaceUuid}/reassignment/{requestedDate}"])
    fun getReassignmentsByDate(@PathVariable spaceUuid: String, @PathVariable requestedDate: String): ResponseEntity<List<Reassignment>> {
        spaceService.checkReadOnlyAccessByDate(requestedDate, spaceUuid)

        val reassignmentsByExactDate = assignmentService.getReassignmentsByExactDate(spaceUuid, LocalDate.parse(requestedDate))
        logger.logInfoMessage("All reassignments retrieved for space with uuid: [$spaceUuid] on date: [$requestedDate].")
        return ResponseEntity.ok(reassignmentsByExactDate ?: emptyList())
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'modify')")
    @PostMapping(path = ["/api/spaces/{spaceUuid}/person/{personId}/assignment/create"])
    fun createAssignmentsForDate(
            @PathVariable spaceUuid: String,
            @PathVariable personId: Int,
            @RequestBody createAssignmentRequest: CreateAssignmentsRequest
    ): ResponseEntity<Set<Assignment>> {
        val assignmentsCreated: Set<Assignment> = assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(createAssignmentRequest, spaceUuid, personId)
        logger.logInfoMessage("[${assignmentsCreated.size}] assignment(s) created " +
                "for person with id: [${assignmentsCreated.first().person.id}] " +
                "with effective date: [${assignmentsCreated.first().effectiveDate}]")
        return ResponseEntity.ok(assignmentsCreated)
    }

    @PreAuthorize("hasPermission(#spaceUuid, 'modify')")
    @DeleteMapping(path = ["/api/spaces/{spaceUuid}/person/{personId}/assignment/delete/{requestedDate}"])
    fun deleteAssignmentForDate(
        @PathVariable spaceUuid: String,
        @PathVariable personId: Int,
        @PathVariable requestedDate: String
    ): ResponseEntity<Unit> {
        assignmentService.revertAssignmentsForDate(LocalDate.parse(requestedDate), spaceUuid, personId)
        logger.logInfoMessage("assignment deleted " +
                "for person with id: [${personId}] " +
                "with effective date: [${requestedDate}]")
        return ResponseEntity.ok().build()
    }
}
