/*
 * Copyright (c) 2019 Ford Motor Company
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

package com.ford.internalprojects.peoplemover.report

import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import com.google.common.collect.Lists
import org.springframework.stereotype.Service
import java.time.LocalDate
import kotlin.streams.toList

@Service
class ReportGeneratorService(
    private val spaceRepository: SpaceRepository,
    private val productService: ProductService,
    private val assignmentService: AssignmentService,
    private val userSpaceMappingRepository: UserSpaceMappingRepository
) {
    fun createPeopleReport(spaceUuid: String, requestedDate: LocalDate): List<PeopleReportRow> {
        spaceRepository.findByUuid(spaceUuid) ?: throw SpaceNotExistsException(spaceUuid)

        val assignments = assignmentService.getAssignmentsByDate(spaceUuid, requestedDate)
        val products = productService.findAllBySpaceUuidAndDate(spaceUuid, requestedDate)

        val peopleReport: MutableList<PeopleReportRow> = mutableListOf()
        assignments.forEach { assignment ->
            peopleReport.add(PeopleReportRow(
                productName = products.find { it.id == assignment.productId }!!.name,
                personName = assignment.person.name,
                personRole = assignment.person.spaceRole?.name ?: ""
            ))
        }
        return peopleReport.sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER) { it.personName })
                .sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER) { it.productName })
    }

    fun createSpacesReport(): List<SpaceReportItem> {
        val allSpaces = spaceRepository.findAll().toList()
        val userSpaceMappings = userSpaceMappingRepository.findAll().toList()

        val spaceReport = allSpaces.stream().map { space ->
            val users: List<String?> = mapUsersToSpace(userSpaceMappings, space)
            SpaceReportItem(space.name, space.createdBy, users)
        }.toList()

        return spaceReport
    }

    private fun mapUsersToSpace(userSpaceMappings: List<UserSpaceMapping>, space: Space): List<String?> {
        return userSpaceMappings.stream()
                .filter { mapping -> mapping.spaceId == space.id }
                .map { mapping2 -> mapping2.userId }.toList()
    }

    fun createUsersReport(): List<String> {
        return userSpaceMappingRepository.findAll()
                .distinctBy{ it.userId!! }
                .map{ it.userId!! }
    }
}
