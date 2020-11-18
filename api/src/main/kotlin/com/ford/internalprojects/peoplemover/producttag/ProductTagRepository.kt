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

package com.ford.internalprojects.peoplemover.producttag

import com.ford.internalprojects.peoplemover.baserepository.PeopleMoverRepository
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Repository

@Repository
interface ProductTagRepository : PeopleMoverRepository<ProductTag, Int> {
    fun findAllByNameIgnoreCaseAndSpaceId(name: String, spaceId: Int): ProductTag?

    fun findAllByNameAndSpaceId(name: String, spaceId: Int): ProductTag?

    //Sorting can not be done with ignore case in JPA
    fun findAllBySpaceId(spaceId: Int, name: Sort): List<ProductTag>
}