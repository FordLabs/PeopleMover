package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.baserepository.Auditable
import javax.persistence.*

@Entity
data class UserSpaceMapping(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Int? = null,

        @Column(name = "user_id")
        val userId: String?,

        @Column(name = "space_uuid")
        val spaceUuid: String

) : Auditable()
