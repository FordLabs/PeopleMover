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

import {AvailableActions} from '../Actions';
import {ProductCardRefAndProductPair} from '../../Products/ProductDnDHelper';

const productRefsReducer = (
    state: Array<ProductCardRefAndProductPair> = [],
    action: {type: AvailableActions; productRef: ProductCardRefAndProductPair}
): Array<ProductCardRefAndProductPair> => {
    if (action.type === AvailableActions.REGISTER_PRODUCT_REF) {
        return [...state, action.productRef];
    } else if (action.type === AvailableActions.UNREGISTER_PRODUCT_REF) {
        const remainingProductRefs = state.filter(
            productRef => productRef.ref !== action.productRef.ref && productRef.ref.current !== null
        );
        return [...remainingProductRefs];
    } else {
        return state;
    }
};

export default productRefsReducer;