/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

var binary, // base 2
    octal, // base 8
    decimal, // base 10
    hex, // base 16
    roman;
// chinese numerals

//wikipedia.org/wiki/List_of_numeral_systems



var base2set = ['0', '1'],
    base8set = ['0', '1', '2', '3', '4', '5', '6', '7'],
    base10set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    base16set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
    baseSet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
    romanSet = { // line on top ( ̄ ) means *1000
        1: 'I',
        4: 'IV',
        5: 'V',
        9: 'IX',
        10: 'X',
        40: 'XL',
        50: 'L',
        90: 'XC',
        100: 'C',
        400: 'CD',
        500: 'D',
        900: 'CM',
        1000: 'M',
        4000: 'MV&#772', // MV̄
        5000: 'V&#772', // V̄
        9000: 'MX&#772', // MX̄
        10000: 'X&#772', // X̄
        40000: 'X&#772L&#772', // X̄L̄
        50000: 'L&#772', // L̄
        90000: 'X&#772C&#772', // X̄C̄
        100000: 'C&#772', // C̄
        400000: 'C&#772D&#772', // C̄D̄
        500000: 'D&#772', // D̄
        900000: 'C&#772M&#772', // C̄M̄
        1000000: 'M&#772' // M̄
    };

function covertToRoman(number) {
    "use strict";
    if (number === 0) { return ""; } // end recursion when number is 0
    var keyset = Object.keys(romanSet),
        key = Math.max.apply(Math, keyset.filter(function (k) {return k <= number; })); // largest key that is less than number
    return romanSet[key] + covertToRoman(number - key);
}

// call stack size may exceed max for really big numbers because function uses recursion
function convertFromBase10(number, base) {
    "use strict";
    var r = number % base; // get the mod/remainder
    if (r === number) {
        return baseSet[r];
    } else {
        return convertFromBase10((number - r) / base, base) + baseSet[r];
    }
}

// call stack size may exceed max for really big numbers because function uses recursion
function convertToBase10(number, base) {
    "use strict";
    var digits = number.split(''), // get digits from number '1011' --> [1,0,1,1] && '8C' --> [8,12]
        base10 = 0,
        i = digits.length - 1;
    
    digits.forEach(function (digit) {
        base10 += baseSet.indexOf(digit) * Math.pow(base, i);
        i -= 1;
    });
    return base10;
}

console.log(convertFromBase10(5, 2));
console.log(convertFromBase10(140, 8));
console.log(convertFromBase10(55, 10));
console.log(convertFromBase10(110, 16));

console.log("*", convertToBase10('101', 2));
console.log("*", convertToBase10('214', 8));
console.log("*", convertToBase10('55', 10));
console.log("*", convertToBase10('6E', 16));
console.log("*", convertToBase10('1C4', 16));


console.log("R", covertToRoman(1));
console.log("R", covertToRoman(4));
console.log("R", covertToRoman(943));
console.log("R", covertToRoman(10));
console.log("R", covertToRoman(124900));