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

package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.springframework.http.HttpStatus.FORBIDDEN
import org.springframework.http.HttpStatus.NOT_FOUND
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class AuthController(
    val userSpaceMappingRepository: UserSpaceMappingRepository,
    val spaceRepository: SpaceRepository,
    val authService: AuthService
) {

    @PostMapping("/api/access_token/validate")
    fun validateAccessToken(@RequestBody request: ValidateTokenRequest): ResponseEntity<Unit> {
        authService.validateToken(request.accessToken)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/api/access_token/authenticate")
    fun validateAndAuthenticateAccessToken(@RequestBody request: AuthCheckScopesRequest): ResponseEntity<Void> {
        val validateTokenResponse = authService.validateToken(request.accessToken)

        spaceRepository.findByUuid(request.uuid) ?: return ResponseEntity.status(NOT_FOUND).build()

        val mapping = userSpaceMappingRepository.findByUserIdAndSpaceUuid(validateTokenResponse.sub, request.uuid)
        return if (mapping.isPresent) {
            ResponseEntity.ok().build()
        } else {
            ResponseEntity.status(FORBIDDEN).build()
        }

    }

}
