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

/// <reference types="Cypress" />

describe('Filter', () => {
    beforeEach(() => {
        cy.visitSpace();
        cy.server();
    });

    it('Filter people by role', () => {
        cy.contains('My Product').parentsUntil('[data-testid=productCardContainer]')
            .then(($container) => {
                cy.get($container).find('[data-testid=productPeopleContainer]').children().as('peopleCards');
                cy.get('@peopleCards').should('have.length', 2);
                cy.get('@peopleCards').eq(0).should('contain', 'Jane Smith');
                cy.get('@peopleCards').eq(1).should('contain', 'Bob Barker');

                cy.get('[data-testid=dropdown_button_Role]').click();
                cy.contains('THE SECOND BEST (UNDERSTUDY)').click();
            });

        cy.contains('My Product').parentsUntil('[data-testid=productCardContainer]')
            .then(($container) => {
                cy.get($container).find('[data-testid=productPeopleContainer]').children().as('peopleCards');
                cy.get('@peopleCards');
                cy.get('@peopleCards').should('have.length', 1);
                cy.get('@peopleCards').eq(0).should('contain', 'Bob Barker');
            });

    });

    it('Filter products by location tag', () => {
        cy.get('[data-testid=productCardContainer__my_product]');
        cy.get('[data-testid=productCardContainer__baguette_bakery]');

        cy.get('[data-testid=dropdown_button_Product_Location]').click();
        cy.contains('location1').click();

        cy.get('[data-testid=productCardContainer__my_product]').should('not.exist');
        cy.get('[data-testid=productCardContainer__baguette_bakery]');
    });

    it('Filter products by product tag', () => {
        cy.get('[data-testid=productCardContainer__my_product]');
        cy.get('[data-testid=productCardContainer__baguette_bakery]');

        cy.get('[data-testid=dropdown_button_Product_Tags]').click();
        cy.contains('productTag1').click();

        cy.get('[data-testid=productCardContainer__my_product]');
        cy.get('[data-testid=productCardContainer__baguette_bakery]').should('not.exist');
    });
});
