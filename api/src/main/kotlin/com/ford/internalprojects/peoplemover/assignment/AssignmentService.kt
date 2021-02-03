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

import com.ford.internalprojects.peoplemover.assignment.exceptions.AssignmentNotExistsException
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.person.exceptions.PersonNotExistsException
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.product.exceptions.ProductNotExistsException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDate
import javax.transaction.Transactional

@Service
class AssignmentService(
        private val assignmentRepository: AssignmentRepository,
        private val personRepository: PersonRepository,
        private val productRepository: ProductRepository
) {
    fun getAssignmentsForTheGivenPersonIdAndDate(personId: Int, date: LocalDate): List<Assignment> {
        val allAssignmentsBeforeOrOnDate = assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(personId, date)
        return getAllAssignmentsForPersonOnDate(personId, allAssignmentsBeforeOrOnDate)
    }

    fun getAssignmentsByDate(spaceUuid: String, requestedDate: LocalDate): List<Assignment> {
        val people: List<Person> = personRepository.findAllBySpaceUuid(spaceUuid)
        val allAssignments: MutableList<Assignment> = mutableListOf()
        people.forEach { person ->
            val assignmentsForPerson: List<Assignment> = assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(person.id!!, requestedDate)
            allAssignments.addAll(getAllAssignmentsForPersonOnDate(person.id, assignmentsForPerson))
        }

        return allAssignments
    }

    fun getEffectiveDates(spaceUuid: String): Set<LocalDate> {
        val people: List<Person> = personRepository.findAllBySpaceUuid(spaceUuid)
        val allAssignments: MutableList<Assignment> = mutableListOf()
        people.forEach { person ->
            val assignmentsForPerson: List<Assignment> = assignmentRepository.getByPersonIdAndSpaceUuid(person.id!!, spaceUuid)
            allAssignments.addAll(assignmentsForPerson)
        }

        val uniqueEffectiveDates = allAssignments.mapNotNull { it.effectiveDate }.toSet()

        return uniqueEffectiveDates.filterNot { effectiveDate -> getReassignmentsByExactDate(spaceUuid, effectiveDate).isNullOrEmpty() }.toSet()
    }

    fun getReassignmentsByExactDate(spaceUuid: String, requestedDate: LocalDate): List<Reassignment>? {
        val assignmentsWithExactDate = assignmentRepository.findAllBySpaceUuidAndEffectiveDate(spaceUuid = spaceUuid, requestedDate = requestedDate).sortedWith(compareByDescending { it.id })
        val assignmentsWithPreviousDate = getAssignmentsWithPreviousDate(assignmentsWithExactDate, requestedDate)

        return createReassignments(assignmentsWithExactDate, assignmentsWithPreviousDate)
    }

    fun createAssignmentFromCreateAssignmentsRequestForDate(assignmentRequest: CreateAssignmentsRequest, spaceUuid: String, personId: Int): Set<Assignment> {
        val person = personRepository.findByIdAndSpaceUuid(personId, spaceUuid) ?: throw PersonNotExistsException()
        deleteAssignmentsForDate(assignmentRequest.requestedDate, person)
        return if (assignmentRequest.products.isNullOrEmpty() || requestOnlyContainsUnassigned(assignmentRequest, spaceUuid)) {
            setOf(createUnassignmentForDate(assignmentRequest.requestedDate, person))
        } else {
            createAssignmentsForDate(assignmentRequest, spaceUuid, person)
        }
    }

    fun changeProductStartDateForOneAssignment(assignment: Assignment, updatedDate: LocalDate) {
        val currentAssignments = getAssignmentsForTheGivenPersonIdAndDate(assignment.person.id!!, updatedDate)
        deleteOneAssignment(assignment)

        if (currentAssignments.contains(assignment)) {
            val updatedAssignment = assignment.copy(id = null, effectiveDate = updatedDate)
            val allAssignments = assignmentRepository.findAllByPersonAndEffectiveDate(assignment.person, assignment.effectiveDate!!)
                    .map { it.copy(id = null, effectiveDate = updatedDate) }
                    .plus(updatedAssignment)
            assignmentRepository.saveAll(allAssignments)
        }
    }

    fun revertAssignmentsForDate(requestedDate: LocalDate, person: Person) {
        deleteAssignmentsForDate(requestedDate, person)
        val existingAssignments = assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(person.id!!, requestedDate)
        if (existingAssignments.isNullOrEmpty()) {
            createUnassignmentForDate(requestedDate, person)
        }
    }

    @Transactional
    fun deleteOneAssignment(assignmentToDelete: Assignment) {
        assignmentRepository.deleteEntityAndUpdateSpaceLastModified(assignmentToDelete)
    }

    fun deleteAssignmentsForDate(requestedDate: LocalDate, person: Person) {
        personRepository.findByIdAndSpaceUuid(person.id!!, person.spaceUuid) ?: throw PersonNotExistsException()

        val assignments: List<Assignment> = assignmentRepository.findAllByPersonAndEffectiveDate(
                person,
                requestedDate
        )
        assignments.forEach { deleteOneAssignment(it) }
    }

    private fun getAllAssignmentsForPersonOnDate(personId: Int, sortedAssignmentsForPerson: List<Assignment>): List<Assignment> {
        return if (sortedAssignmentsForPerson.isNotEmpty()) {
            val lastDate: LocalDate = sortedAssignmentsForPerson.last().effectiveDate!!
            sortedAssignmentsForPerson.filter { it.effectiveDate == lastDate }
        } else {
            assignmentRepository.findAllByEffectiveDateIsNullAndPersonId(personId)
        }
    }

    private fun getAssignmentsWithPreviousDate(assignmentsWithExactDate: List<Assignment>, requestedLocalDate: LocalDate): List<Assignment> {
        val personIdsWithExactDate = assignmentsWithExactDate.map { assignment -> assignment.person.id }.toSet()

        var assignmentsWithPreviousDate: MutableList<Assignment> = mutableListOf()
        val previousRequestedLocalDate = requestedLocalDate.minusDays(1)
        personIdsWithExactDate.forEach { personId ->
            val assignmentsForPerson: List<Assignment> =
                    assignmentRepository.findAllByPersonIdAndEffectiveDateLessThanEqualOrderByEffectiveDateAsc(
                            personId = personId!!,
                            effectiveDate = previousRequestedLocalDate!!
                    )
            assignmentsWithPreviousDate.addAll(getAllAssignmentsForPersonOnDate(personId, assignmentsForPerson))
        }
        return assignmentsWithPreviousDate
    }

    private fun createReassignments(assignmentsWithExactDate: List<Assignment>, assignmentsWithPreviousDate: List<Assignment>): List<Reassignment> {
        val pair = removeDuplicatePersonsAndProducts(assignmentsWithExactDate, assignmentsWithPreviousDate)
        val assignmentsWithExactDateWithoutDuplicates = pair.first
        val assignmentsWithPreviousDateWithoutDuplicates = pair.second

        val peopleFromAssignments: Set<Person> = getUniqueSetOfPeopleFromAssignments(assignmentsWithExactDateWithoutDuplicates, assignmentsWithPreviousDateWithoutDuplicates).toSet()

        return peopleFromAssignments.map { person ->
            val exactAssignmentsForPerson = assignmentsWithExactDateWithoutDuplicates.filter { assignment ->
                person.id === assignment.person.id
            }
            val previousAssignmentsForPerson = assignmentsWithPreviousDateWithoutDuplicates.filter { assignment ->
                person.id === assignment.person.id
            }

            val toProductName: String = exactAssignmentsForPerson.map { assignment ->  productRepository.findById(assignment.productId).get().name}.joinToString(" & ")
            val fromProductName: String = previousAssignmentsForPerson.map { assignment ->  productRepository.findById(assignment.productId).get().name}.joinToString(" & ")
            Reassignment(
                    person = person,
                    fromProductName = fromProductName,
                    toProductName = toProductName
            )
        }.filterNot {  reassignment ->  reassignment.toProductName == "unassigned" && reassignment.fromProductName.isNullOrEmpty() }
    }

    private fun requestOnlyContainsUnassigned(assignmentRequest: CreateAssignmentsRequest, spaceUuid: String): Boolean {
        val unassignedProduct: Product? = productRepository.findProductByNameAndSpaceUuid("unassigned", spaceUuid)
        return (assignmentRequest.products.size == 1 && assignmentRequest.products.first().productId == unassignedProduct!!.id)
    }

    private fun createUnassignmentForDate(requestedDate: LocalDate, person: Person): Assignment {
        val unassignedProduct: Product? = productRepository.findProductByNameAndSpaceUuid("unassigned", person.spaceUuid)
        return assignmentRepository.saveAndUpdateSpaceLastModified(
                Assignment(
                        person = person,
                        placeholder = false,
                        productId = unassignedProduct!!.id!!,
                        effectiveDate = requestedDate,
                        spaceUuid = person.spaceUuid
                )
        )
    }

    private fun createAssignmentsForDate(assignmentRequest: CreateAssignmentsRequest, spaceUuid: String, person: Person): Set<Assignment> {
        val createdAssignments = hashSetOf<Assignment>()
        val unassignedProduct: Product? = productRepository.findProductByNameAndSpaceUuid("unassigned", spaceUuid)

        assignmentRequest.products.forEach { product ->
            productRepository.findByIdOrNull(product.productId) ?: throw ProductNotExistsException()

            if(product.productId != unassignedProduct!!.id) {
                val assignment = assignmentRepository.saveAndUpdateSpaceLastModified(
                        Assignment(
                                person = person,
                                placeholder = product.placeholder,
                                productId = product.productId,
                                effectiveDate = assignmentRequest.requestedDate,
                                spaceUuid = spaceUuid
                        )
                )
                createdAssignments.add(assignment)
            }
        }
        return createdAssignments
    }

    private fun removeDuplicatePersonsAndProducts(assignmentsWithExactDate: List<Assignment>, assignmentsWithPreviousDate: List<Assignment>): Pair<List<Assignment>, MutableList<Assignment>> {
        var assignmentsWithExactDate1 = assignmentsWithExactDate
        var assignmentsWithPreviousDate1 = assignmentsWithPreviousDate
        val personIdProductIdPairsWithExactDate = assignmentsWithExactDate1.map { Pair(it.person.id, it.productId) }
        val personIdProductIdPairsForPreviousDate = assignmentsWithPreviousDate1.map { Pair(it.person.id, it.productId) }
        val commonPersonIdProductIdPairs = personIdProductIdPairsWithExactDate intersect personIdProductIdPairsForPreviousDate

        assignmentsWithExactDate1 = assignmentsWithExactDate1.filter { !commonPersonIdProductIdPairs.contains(Pair(it.person.id, it.productId)) }
        assignmentsWithPreviousDate1 = assignmentsWithPreviousDate1.filter { !commonPersonIdProductIdPairs.contains(Pair(it.person.id, it.productId)) }.toMutableList()
        return Pair(assignmentsWithExactDate1, assignmentsWithPreviousDate1)
    }

    private fun getUniqueSetOfPeopleFromAssignments(assignmentsWithExactDateWithoutDuplicates: List<Assignment>, assignmentsWithPreviousDateWithoutDuplicates: MutableList<Assignment>): MutableList<Person> {
        val peopleFromAssignments: MutableList<Person> = mutableListOf()
        peopleFromAssignments.addAll(
                assignmentsWithExactDateWithoutDuplicates.map { assignment ->
                    assignment.person
                }
        )
        peopleFromAssignments.addAll(
                assignmentsWithPreviousDateWithoutDuplicates.map { assignment ->
                    assignment.person
                }
        )
        return peopleFromAssignments
    }

    fun deleteAllAssignments(personId: Int, spaceUuid: String) {
        val assignments: List<Assignment> = assignmentRepository.getByPersonIdAndSpaceUuid(personId, spaceUuid)
        assignments.forEach { deleteOneAssignment(it) }
    }

    @Throws(AssignmentNotExistsException::class, ProductNotExistsException::class)
    fun updateAssignment(assignmentToUpdate: Assignment) {
        assignmentRepository.findByIdOrNull(assignmentToUpdate.id!!) ?: throw AssignmentNotExistsException()
        productRepository.findByIdOrNull(assignmentToUpdate.productId) ?: throw ProductNotExistsException()

        assignmentRepository.saveAndUpdateSpaceLastModified(assignmentToUpdate)
    }
}
