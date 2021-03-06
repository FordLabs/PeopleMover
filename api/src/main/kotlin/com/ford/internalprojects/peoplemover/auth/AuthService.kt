package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.auth.exceptions.InvalidTokenException
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.stereotype.Service

@Service
class AuthService (
        @Value("\${com.ford.people-mover.secured-report.users}") val users: String = "none",
        private val jwtDecoder: JwtDecoder
){
    fun validateToken(accessToken: String): OAuthVerifyResponse {
        return try {
            val jwt = jwtDecoder.decode(accessToken)
            OAuthVerifyResponse(jwt.subject, emptyList(), jwt.expiresAt!!.toEpochMilli(), jwt.issuer.toString(), jwt.subject)
        } catch (e: Exception) {
            throw InvalidTokenException()
        }
    }

    fun requestIsAuthorizedFromReportProperties(authentication: Authentication): Boolean {
        val authorizedUsers = users.toLowerCase().split(",")
        return authorizedUsers.contains(authentication.name.toLowerCase())
    }
}