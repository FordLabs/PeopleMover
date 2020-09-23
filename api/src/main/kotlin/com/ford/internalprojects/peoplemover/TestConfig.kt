package com.ford.internalprojects.peoplemover

import com.ford.internalprojects.peoplemover.auth.exceptions.InvalidTokenException
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import java.time.Instant
import java.util.HashMap

@Configuration
@Profile("test", "e2e-test")
class TestConfig {

    @Bean
    fun mockJwtDecoder(): JwtDecoder {
        return MockJwtDecoder()
    }

}

private class MockJwtDecoder : JwtDecoder {
    override fun decode(token: String?): Jwt {
        if (token.equals("INVALID_TOKEN")) {
            throw InvalidTokenException()
        }
        val accessToken = "valid_Token"
        val headers = HashMap<String, Any>()
        headers["typ"] = "JWT"
        val claims = HashMap<String, Any>()
        claims["sub"] = "USER_ID"
        val issuedAt = Instant.now()
        val expiresAt = Instant.now().plusSeconds(60)
        claims["expiresAt"] = expiresAt
        claims["iss"] = "https://localhost"
        return Jwt(accessToken, issuedAt, expiresAt, headers, claims)
    }
}