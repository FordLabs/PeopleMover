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

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
class ReportGeneratorController(private val reportGeneratorService: ReportGeneratorService) {

    @GetMapping("/api/reportgenerator/{spaceUuid}/{requestedDate}")
    fun getReportWithNames(@PathVariable spaceUuid: String, @PathVariable requestedDate: String): ResponseEntity<List<ReportGenerator>> {
        return ResponseEntity.ok(reportGeneratorService.getReportWithNames(spaceUuid, LocalDate.parse(requestedDate)))
    }

}