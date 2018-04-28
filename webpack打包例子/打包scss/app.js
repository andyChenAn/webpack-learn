import './index.scss';
import $ from 'jquery';
class Person {
    constructor (name , age) {
        this.name = name;
        this.age = age;
    }
    write () {
        $('#app').text(this.name + this.age);
    }
};
const person = new Person('andy' , 20);
person.write();