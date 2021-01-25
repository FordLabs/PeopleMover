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

package com.ford.internalprojects.peoplemover.role

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.color.Color
import com.ford.internalprojects.peoplemover.color.ColorRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@AutoConfigureMockMvc
@RunWith(SpringRunner::class)
@ActiveProfiles("test")
@SpringBootTest
class RoleControllerApiTest {

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var spaceRolesRepository: SpaceRolesRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var colorRepository: ColorRepository

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    private lateinit var space: Space

    var baseRolesUrl: String = ""

    fun getBaseRolesUrl(spaceUuid: String) = "/api/spaces/$spaceUuid/roles"

    @Before
    fun setUp() {
        space = spaceRepository.save(Space(name = "tok"))

        baseRolesUrl = getBaseRolesUrl(space.uuid)
        userSpaceMappingRepository.save(UserSpaceMapping(spaceId = space.id!!, userId = "USER_ID", spaceUuid = space.uuid))
    }

    @After
    fun tearDown() {
        personRepository.deleteAll()
        spaceRolesRepository.deleteAll()
        colorRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Test
    fun `GET should return roles`() {
        val role1: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Fireman", spaceUuid = space.uuid))
        val role2: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Astronaut", spaceUuid = space.uuid))

        val result = mockMvc.perform(get(baseRolesUrl)
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualSpaceRoles: Set<SpaceRole> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, SpaceRole::class.java)
        )

        assertThat(actualSpaceRoles).contains(role1)
        assertThat(actualSpaceRoles).contains(role2)
    }

    @Test
    fun `GET should return 400 when space does not exist`() {
        mockMvc.perform(get(getBaseRolesUrl("doesNotExist"))
                .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `GET should return empty set when space has no roles`() {
        val result = mockMvc
                .perform(get(baseRolesUrl)
                        .header("Authorization", "Bearer GOOD_TOKEN"))
                .andExpect(status().isOk)
                .andReturn()

        val actualSpaceRoles: Set<SpaceRole> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableSet::class.java, SpaceRole::class.java))

        assertThat(actualSpaceRoles).isEmpty()
    }

    @Test
    fun `GET should return 403 when valid token does not have read access and the space's read-only flag is off`() {
        mockMvc.perform(
            get(baseRolesUrl)
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `GET should return 200 when valid token that isn't an editor requests a space while read-only flag is on`() {
        val anonymousUserReadOnlySpace: Space = spaceRepository.save(Space(name = "SpaceOne", todayViewIsPublic = true))
        val role1: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Fireman", spaceUuid = space.uuid))

        mockMvc.perform(get(getBaseRolesUrl(anonymousUserReadOnlySpace.uuid))
            .header("Authorization", "Bearer ANONYMOUS_TOKEN")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(role1)))
            .andExpect(status().isOk)
            .andReturn()
    }

    @Test
    fun `POST should return 409 when trying to add duplicate space role name to same space`() {
        val spaceRole: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Firefighter", spaceUuid = space.uuid))
        val newRole = RoleAddRequest(name = spaceRole.name)

        mockMvc.perform(post(baseRolesUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRole)))
                .andExpect(status().isConflict)
    }

    @Test
    fun `POST should add a role to a space and assign it a color`() {
        colorRepository.save(Color(color = "red"))

        val newRole = RoleAddRequest(name = "Firefighter")
        val result = mockMvc.perform(post(baseRolesUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRole)))
                .andExpect(status().isOk)
                .andReturn()

        val addedSpaceRole: SpaceRole = objectMapper.readValue(
                result.response.contentAsString,
                SpaceRole::class.java
        )
        assertThat(addedSpaceRole.name).isEqualTo(newRole.name)
        assertThat(addedSpaceRole.color).isNotNull()

        val spaceRolesTiedToSpace: Set<SpaceRole> = spaceRolesRepository.findAllBySpaceUuid(space.uuid);
        assertThat(spaceRolesTiedToSpace).containsExactly(addedSpaceRole)
    }

    @Test
    fun `POST should add a role to a space and assign it a color of null when all colors are used`() {
        val usedColor: Color = colorRepository.save(Color(color = "3"))
        spaceRolesRepository.save(SpaceRole(name = "existingRole", color = usedColor, spaceUuid = space.uuid))

        val newRole = RoleAddRequest(name = "Firefighter")
        val result = mockMvc.perform(post(baseRolesUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRole)))
                .andExpect(status().isOk)
                .andReturn()

        val addedSpaceRole: SpaceRole = objectMapper.readValue(
                result.response.contentAsString,
                SpaceRole::class.java
        )
        assertThat(addedSpaceRole.name).isEqualTo(newRole.name)
        assertThat(addedSpaceRole.color).isNull()
    }

    @Test
    fun `POST should add a role to a space with a specified color`() {
        colorRepository.save(Color(color = "unused"))
        val usedColor: Color = colorRepository.save(Color(color = "used"))

        val newRole = RoleAddRequest(name = "Firefighter", colorId = usedColor.id)

        val result = mockMvc.perform(post(baseRolesUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRole)))
                .andExpect(status().isOk)
                .andReturn()
        val actualSpaceRole: SpaceRole = objectMapper.readValue(
                result.response.contentAsString,
                SpaceRole::class.java
        )
        assertThat(actualSpaceRole.name).isEqualTo(newRole.name)
        assertThat(actualSpaceRole.color).isEqualTo(usedColor)
    }

    @Test
    fun `POST should return 403 when trying to add a role without write authorization`() {
        val requestBodyObject = RoleAddRequest("Not a blank")

        mockMvc.perform(post(baseRolesUrl)
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject)))
                .andExpect(status().isForbidden)

    }

    @Test
    fun `PUT should update roles of associated people when editing space role name`() {
        val originalSpaceRole: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Software Engineer", spaceUuid = space.uuid))

        val person1: Person = personRepository.save(Person(name = "Jack", spaceRole = originalSpaceRole, spaceUuid = space.uuid))
        val person2: Person = personRepository.save(Person(name = "Jill", spaceRole = originalSpaceRole, spaceUuid = space.uuid))

        val updatedRoleName = "Blobware Engineer"
        val roleEditRequest = RoleEditRequest(id = originalSpaceRole.id!!, name = updatedRoleName)

        mockMvc.perform(put(baseRolesUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(roleEditRequest)))
                .andExpect(status().isOk)

        val actualPerson1: Person = personRepository.findByIdOrNull(person1.id!!)!!
        val actualPerson2: Person = personRepository.findByIdOrNull(person2.id!!)!!

        assertThat(actualPerson1.spaceRole?.name).isEqualTo(updatedRoleName)
        assertThat(actualPerson2.spaceRole?.name).isEqualTo(updatedRoleName)
    }

    @Test
    fun `PUT should return 409 when trying to edit role name to existing role name`() {
        val spaceRole1: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Firefighter", spaceUuid = space.uuid))
        val spaceRole2: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Astronaut", spaceUuid = space.uuid))
        val roleEditRequest = RoleEditRequest(id = spaceRole2.id!!, name = spaceRole1.name)

        mockMvc.perform(put(baseRolesUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(roleEditRequest)))
                .andExpect(status().isConflict)
    }

    @Test
    fun `PUT should return 400 when trying to edit non existent role`() {
        mockMvc.perform(put(baseRolesUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(RoleEditRequest(name = "role1", id = 0))))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should edit space role`() {
        val blueColor: Color = colorRepository.save(Color(color = "blue"))
        val greenColor: Color = colorRepository.save(Color(color = "green"))
        val spaceRole: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "Fireman Astronaut", color = blueColor, spaceUuid = space.uuid))

        val updatedRoleName = "Herr Doktor-Professor"
        val roleEditRequest = RoleEditRequest(id = spaceRole.id!!, name = updatedRoleName, colorId = greenColor.id)

        val result = mockMvc.perform(put(baseRolesUrl)
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(roleEditRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val updatedSpaceRole: SpaceRole = objectMapper.readValue(
                result.response.contentAsString,
                SpaceRole::class.java
        )
        assertThat(updatedSpaceRole.name).isEqualTo(updatedRoleName)
        assertThat(updatedSpaceRole.color).isEqualTo(greenColor)

        val actualRoles: Set<SpaceRole> = spaceRolesRepository.findAllBySpaceUuid(space.uuid)

        val doctorIsIn = actualRoles.any { actualRole -> updatedRoleName == actualRole.name }
        val astroNotIn = actualRoles.any { actualRole -> updatedRoleName == actualRole.name }
        assertThat(doctorIsIn).isTrue()
        assertThat(astroNotIn).isTrue()
    }

    @Test
    fun `PUT should return 403 when trying to edit a role without write authorization`() {
        val requestBodyObject = RoleEditRequest(99999, "Not a blank")

        mockMvc.perform(put(baseRolesUrl)
                .header("Authorization", "Bearer ANONYMOUS_TOKEN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBodyObject)))
                .andExpect(status().isForbidden)

    }

    @Test
    fun `DELETE should delete a space role from a space`() {
        val spaceRole: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "role1", spaceUuid = space.uuid))

        mockMvc.perform(delete("$baseRolesUrl/${spaceRole.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk)

        assertThat(spaceRolesRepository.count()).isZero()
    }

    @Test
    fun `DELETE should set space role on associated person to null `() {
        val spaceRole: SpaceRole = spaceRolesRepository.save(SpaceRole(name = "role1", spaceUuid = space.uuid))
        val person: Person = personRepository.save(Person(
                name = "Jenny",
                spaceRole = spaceRole,
                spaceUuid = space.uuid
        ))

        mockMvc.perform(delete("$baseRolesUrl/${spaceRole.id}")
                .header("Authorization", "Bearer GOOD_TOKEN")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk)

        val updatedPerson: Person = personRepository.findByIdOrNull(person.id!!)!!
        assertThat(updatedPerson.spaceRole).isNull()
    }


    @Test
    fun `DELETE should return 403 when trying to delete a role without write authorization`() {
        mockMvc.perform(delete("$baseRolesUrl/111")
                .header("Authorization", "Bearer ANONYMOUS_TOKEN"))
                .andExpect(status().isForbidden)
    }
}
