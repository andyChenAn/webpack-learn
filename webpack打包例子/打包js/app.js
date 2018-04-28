class Person {
    constructor (name , age) {
        this.name = name;
        this.age = age;
    }
    sayHello () {
        console.log(this.name);
    }
};
const person = new Person('andy' , 20);
person.sayHello();