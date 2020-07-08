interface Person {
    name: string;
    isNew: boolean;
    role: string;
    assignTo: string;
    notes: string;
}

const person: Person = {
    name: 'Person Name',
    isNew: true,
    role: 'Product Owner',
    assignTo: 'My Product',
    notes: 'Here is a thought you might want to remember.',
};

export default person;