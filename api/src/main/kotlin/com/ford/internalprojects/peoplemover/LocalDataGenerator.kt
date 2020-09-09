package com.ford.internalprojects.peoplemover

import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.assignment.CreateAssignmentsRequest
import com.ford.internalprojects.peoplemover.assignment.ProductPlaceholderPair
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.color.Color
import com.ford.internalprojects.peoplemover.color.ColorService
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonService
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.role.RoleService
import com.ford.internalprojects.peoplemover.role.SpaceRole
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.utilities.HelperUtils
import com.google.common.collect.Sets
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.time.LocalDate

@Configuration
@Profile("local", "e2e-test")
class LocalDataGenerator(
        private val spaceRepository: SpaceRepository,
        private val productService: ProductService,
        private val roleService: RoleService,
        private val userSpaceMappingRepository: UserSpaceMappingRepository,
        private val colorService: ColorService,
        private val personService: PersonService,
        private val productRepository: ProductRepository,
        private val assignmentService: AssignmentService
) {

    fun setSpace(uuid: String) {
        generateSpaceData(uuid, true)
    }

    fun resetSpace(uuid: String) {
        return generateSpaceData(uuid, false)
    }

    private fun generateSpaceData(uuid: String, addColors: Boolean) {
        val spaceName = "Flipping Sweet"
        val createdSpace: Space = spaceRepository.save(
                Space(name = spaceName, uuid = uuid ,lastModifiedDate = HelperUtils.currentTimeStamp)
        )
        productService.createDefaultProducts(createdSpace);

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "AQ-866ed9fa-06ca-41e7-b256-30770b98195f", spaceId = createdSpace.id))

        if (addColors) {
            colorService.addColors(listOf("#FFFF00", "#FF00FF", "#00FFFF"))
        }
        val colors: List<Color?> = colorService.getColors()

        val role1: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE BEST", colors[0]?.id)
        val role2: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE SECOND BEST (UNDERSTUDY)", colors[1]?.id)
        val role3: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE WURST", colors[2]?.id)

        val jane: Person = personService.createPerson(
                Person(
                        name = "Jane Smith",
                        spaceId = createdSpace.id!!,
                        spaceRole = role1
                ),
                createdSpace.uuid
        )
        val bob: Person = personService.createPerson(
                Person(
                        name = "Bob Barker",
                        spaceId = createdSpace.id,
                        spaceRole = role2
                ),
                createdSpace.uuid
        )
        val adam: Person = personService.createPerson(
                Person(
                        name = "Adam Sandler",
                        spaceId = createdSpace.id,
                        spaceRole = role3
                ),
                createdSpace.uuid
        )
        productRepository.save(Product(
                name = "My Product",
                spaceId = createdSpace.id,
                startDate = LocalDate.parse("2019-01-01")
        ))
        productRepository.save(Product(
                name = "Baguette Bakery",
                spaceId = createdSpace.id,
                startDate = LocalDate.parse("2019-01-01")
        ))

        val savedProducts: List<Product> = productRepository.findAllBySpaceId(spaceId = createdSpace.id)

        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
                requestedDate = LocalDate.parse("2019-01-01"),
                person = jane,
                products = Sets.newHashSet(ProductPlaceholderPair(
                        productId = savedProducts[1].id!!,
                        placeholder = false
                ))
        ))
        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
                requestedDate = LocalDate.now(),
                person = bob,
                products = Sets.newHashSet(ProductPlaceholderPair(
                        productId = savedProducts[1].id!!,
                        placeholder = true
                ))
        ))
        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
                requestedDate = LocalDate.parse("2020-06-01"),
                person = adam,
                products = Sets.newHashSet()
        ))
    }

}
